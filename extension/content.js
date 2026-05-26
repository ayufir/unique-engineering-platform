chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'FILL_FORM') {
    const data = request.data;
    const uploadedPhotos = request.photos || [];
    
    const flattenedData = flattenObject(data);
    let fillCount = 0;
    
    const promises = [];

    // Inject data directly into React App via window message
    window.postMessage({ type: 'EXTENSION_AUTOFILL', data: data, photos: uploadedPhotos }, '*');

    // Auto-fill text fields (Fallback for non-React or non-integrated pages)
    for (const key in flattenedData) {
      const value = flattenedData[key];
      if (value === null || value === undefined) continue;
      
      let element = null;
      
      // Try exact name or id
      try {
        element = document.querySelector(`input[name="${key}"], textarea[name="${key}"], select[name="${key}"]`);
      } catch(e) {}
      
      if (!element) {
        element = document.getElementById(key);
      }

      const normalizedKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');

      // Try finding by label or td text (strict enough to avoid false positives)
      if (!element && normalizedKey.length > 2) {
        const textElements = Array.from(document.querySelectorAll('label, td, th, span'));
        
        for (const el of textElements) {
          const elText = el.innerText.toLowerCase().replace(/[^a-z0-9]/g, '');
          
          // Match logic: exact or very similar
          if (elText === normalizedKey || (elText.length > 4 && normalizedKey.includes(elText)) || (normalizedKey.length > 4 && elText.includes(normalizedKey))) {
            
            // Look for input inside parent or next sibling
            element = el.parentElement.querySelector('input:not([type="file"]), textarea, select');
            if (!element && el.nextElementSibling) {
               element = el.nextElementSibling.querySelector('input:not([type="file"]), textarea, select');
               if (!element && ['INPUT', 'TEXTAREA', 'SELECT'].includes(el.nextElementSibling.tagName)) {
                   element = el.nextElementSibling;
               }
            }
            if (element) break;
          }
        }
      }

      const isImageUrl = typeof value === 'string' && (value.startsWith('http') || value.startsWith('data:image')) && (value.match(/\.(jpeg|jpg|gif|png)$/i) || value.includes('cloudinary') || value.includes('aws'));

      if (element) {
        if (element.type === 'file' && isImageUrl) {
          promises.push(fillFileInput(element, value));
          fillCount++;
        } else if (element.type !== 'file') {
          // For react inputs, we need to set value and dispatch events
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, "value")?.set;
          const nativeTextAreaValueSetter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, "value")?.set;
          
          if (element.tagName === 'INPUT' && nativeInputValueSetter) {
             nativeInputValueSetter.call(element, value);
          } else if (element.tagName === 'TEXTAREA' && nativeTextAreaValueSetter) {
             nativeTextAreaValueSetter.call(element, value);
          } else {
             element.value = value;
          }
          
          element.dispatchEvent(new Event('input', { bubbles: true }));
          element.dispatchEvent(new Event('change', { bubbles: true }));
          fillCount++;
        }
      }
    }

    // Auto-fill uploaded photos from the extension popup
    if (uploadedPhotos.length > 0) {
      const fileInputs = document.querySelectorAll('input[type="file"]');
      if (fileInputs.length > 0) {
        const dataTransfer = new DataTransfer();
        
        uploadedPhotos.forEach(photo => {
          const arr = photo.dataUrl.split(',');
          const bstr = atob(arr[1]);
          let n = bstr.length;
          const u8arr = new Uint8Array(n);
          while(n--){
              u8arr[n] = bstr.charCodeAt(n);
          }
          const file = new File([u8arr], photo.name, {type: photo.type});
          dataTransfer.items.add(file);
        });

        // Find "Subject Property" input specifically
        let targetInput = null;
        const allElements = Array.from(document.querySelectorAll('*'));
        for (const el of allElements) {
            // We check if it contains the text exactly (ignoring child tags if any)
            if (el.children.length === 0 && el.textContent) {
                const text = el.textContent.trim().toLowerCase();
                if (text === 'subject property' || text === 'site photographs') {
                    let current = el;
                    for (let i = 0; i < 5; i++) { // search up to 5 ancestors
                    if (current && current.parentElement) {
                        current = current.parentElement;
                        const input = current.querySelector('input[type="file"]');
                        if (input) {
                            targetInput = input;
                            break;
                        }
                    }
                }
            }
            if (targetInput) break;
        }

        if (targetInput) {
            targetInput.files = dataTransfer.files;
            targetInput.dispatchEvent(new Event('change', { bubbles: true }));
        } else {
            // Fallback to all inputs if "Subject Property" not found
            fileInputs.forEach(input => {
              input.files = dataTransfer.files;
              input.dispatchEvent(new Event('change', { bubbles: true }));
            });
        }
        fillCount += uploadedPhotos.length;
      }
    }

    Promise.all(promises).then(() => {
      sendResponse({ status: `Filled ${fillCount} fields (including images).` });
    }).catch(err => {
      sendResponse({ status: `Filled fields with some errors: ${err.message}` });
    });

    return true; 
  }
});

// Helper to flatten nested JSON objects
function flattenObject(ob) {
  var toReturn = {};
  for (var i in ob) {
    if (!ob.hasOwnProperty(i)) continue;
    if ((typeof ob[i]) == 'object' && ob[i] !== null) {
      var flatObject = flattenObject(ob[i]);
      for (var x in flatObject) {
        if (!flatObject.hasOwnProperty(x)) continue;
        toReturn[i + '.' + x] = flatObject[x];
      }
    } else {
      toReturn[i] = ob[i];
    }
  }
  return toReturn;
}

async function fillFileInput(inputElement, imageUrl) {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    // determine filename from url or use a default
    const filename = imageUrl.split('/').pop().split('#')[0].split('?')[0] || 'uploaded_image.png';
    const file = new File([blob], filename, { type: blob.type });
    
    const dataTransfer = new DataTransfer();
    dataTransfer.items.add(file);
    
    inputElement.files = dataTransfer.files;
    inputElement.dispatchEvent(new Event('change', { bubbles: true }));
  } catch (error) {
    console.error('Error fetching or setting image:', error);
  }
}
