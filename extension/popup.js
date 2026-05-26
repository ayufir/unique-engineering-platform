document.getElementById('fillBtn').addEventListener('click', async () => {
  const jsonInput = document.getElementById('jsonFile');
  const photoInput = document.getElementById('photoFiles');
  const statusDiv = document.getElementById('status');
  
  if (!jsonInput.files.length) {
    statusDiv.textContent = 'Please select a JSON file first.';
    statusDiv.style.color = 'red';
    return;
  }

  statusDiv.textContent = 'Reading files...';
  statusDiv.style.color = 'blue';

  try {
    // Read JSON
    const jsonFile = jsonInput.files[0];
    const jsonText = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = e => reject(e);
      reader.readAsText(jsonFile);
    });
    const data = JSON.parse(jsonText);

    // Read Photos
    const photos = [];
    if (photoInput.files.length > 0) {
      for (let i = 0; i < photoInput.files.length; i++) {
        const file = photoInput.files[i];
        const dataUrl = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = e => resolve(e.target.result);
          reader.onerror = e => reject(e);
          reader.readAsDataURL(file);
        });
        photos.push({
          name: file.name,
          type: file.type,
          dataUrl: dataUrl
        });
      }
    }

    statusDiv.textContent = 'Sending to page...';

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.tabs.sendMessage(tabs[0].id, { action: 'FILL_FORM', data: data, photos: photos }, (response) => {
        if (chrome.runtime.lastError) {
          statusDiv.textContent = 'Error: ' + chrome.runtime.lastError.message;
          statusDiv.style.color = 'red';
        } else {
          statusDiv.textContent = response ? response.status : 'No response from content script.';
          statusDiv.style.color = 'green';
        }
      });
    });

  } catch (error) {
    statusDiv.textContent = 'Error processing files: ' + error.message;
    statusDiv.style.color = 'red';
  }
});
