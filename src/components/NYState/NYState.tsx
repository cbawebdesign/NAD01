import { useState, useEffect } from 'react';
import { getStorage, ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { initialize, document } from '@ironcorelabs/ironweb';

export default function UploadPage() {
  const [files, setFiles] = useState<FileList | null>(null);
  const [isSdkInitialized, setSdkInitialized] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0); // Add this line
  const [uploadedFiles, setUploadedFiles] = useState<{ fileName: string, group: string }[]>([]);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState<string>('');
  const [uploadErrors, setUploadErrors] = useState<string[]>([]);
  const categories = ['Final Q4 CAS', '2024TaxEstimates','Distributions2025','Quarterly Report Q4-2024', 'CAS24Q4', 'Financials-Q42024', 'Quarterly Report Q3-2024', 'Financials-Q32024', 'CAS24Q3', 'Quarterly Report Q2-2024', 'CAS24Q2','Financials-Q2024','Newsletter Q3-2024','Test','K1-2024', 'Quarterly Report Q1-2024','Quarterly Report Q4-2023', 'Financials-Q12024','Financials-Q42023', 'CAS23Q4', 'CAS24Q1', 'CAS23Q4', 'CAS23Q3', 'CAS23Q2', 'Distributions2023', 'Distributions2024'];
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    initialize(
      () => fetch('https://us-central1-test7-8a527.cloudfunctions.net/generateJwt')
        .then(response => response.text()),
      () => Promise.resolve('testpassword'),
    )
    .then(() => setSdkInitialized(true))
    .catch((error: Error) => console.error('Error initializing IronWeb SDK:', error));
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFiles(event.target.files);
  };

  const handleUpload = async () => {
    if (!files || !isSdkInitialized) return;
// Check if a category is selected
if (!selectedCategories) {
  alert('Please select a category before uploading.');
  return;
}
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const storage = getStorage();
      const storageRef = ref(storage, 'groups/' + file.name);

      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on('state_changed', 
        (snapshot) => {
          var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadProgress(progress); // Update the progress
          console.log('Upload is ' + progress + '% done');
        }, 
        (error) => {
          console.log(error);
        }, 
        async () => {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
          console.log('File available at', downloadURL);

          // Convert the download URL string to a Uint8Array
          const urlUint8Array = new TextEncoder().encode(downloadURL);

          // Encrypt the URL
          const encryptedUrlResult = await document.encrypt(urlUint8Array);

          // Convert the encrypted URL to a base64 string
          const encryptedUrl = btoa(String.fromCharCode(...new Uint8Array(encryptedUrlResult.document)));

          // Convert the fileName to a Uint8Array
          const fileNameUint8Array = new TextEncoder().encode(file.name);

          // Encrypt the fileName
          const encryptedFileNameResult = await document.encrypt(fileNameUint8Array);

          // Convert the encrypted fileName to a base64 string
          const encryptedFileName = btoa(String.fromCharCode(...new Uint8Array(encryptedFileNameResult.document)));

          // Make a request to your API to update the group document
          const response = await fetch('/api/uploads/uploads', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              fileName: encryptedFileName,
              url: encryptedUrl,
              originalFileName: file.name, // Send the original file name
              categories: selectedCategories, // Send the selected categories
            }),
          });
// In your API request, add the error message to the uploadErrors array
if (!response.ok) {
  const errorData = await response.json();
  setUploadErrors(prevErrors => [...prevErrors, errorData.error]);
  setHasError(true); // Set hasError to true
} else {
            const data = await response.json();
            console.log(data);
            // After a file is uploaded, add its name to the state
            setUploadedFiles(prevFiles => [...prevFiles, { fileName: file.name, group: data.group }]);
            // Set uploadSuccess to true
            setUploadSuccess(true);
          }
        }
      );
    }
  };
  const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = event.target;
    if (checked) {
      setSelectedCategories(name);

    } else {
      setSelectedCategories('');
    }
  };
  const buttonStyle = {
    backgroundColor: '#0000FF', /* Dark Blue */
    border: 'none',
    color: 'white',
    padding: '15px 32px',
    textAlign: 'center' as 'center',
    textDecoration: 'none',
    display: 'inline-block',
    fontSize: '16px',
    margin: '4px 2px',
    cursor: 'pointer',
    borderRadius: '12px', // This will make the edges rounded
    boxShadow: '0px 8px 15px rgba(0, 0, 0, 0.1)', // This will add a shadow
  };
  const uploadedFileStyle = {
    marginTop: '20px', 
    marginBottom: '20px', 
    border: '1px solid #0000FF', 
    padding: '10px',
    borderRadius: '15px', // This will make the border rounded
    boxShadow: '5px 5px 15px rgba(0, 0, 0, 0.3)', // This will give it a 3D effect
  };
  const categoryStyle = {
    display: 'inline-block',
    margin: '10px',
    padding: '10px',
    borderRadius: '5px',
    backgroundColor: '#f2f2f2',
  };
  const checkboxStyle = {
    backgroundColor: '#ffffff',
  };
  return (
    <div style={{ marginTop: '50px' }}>
      <input 
        type="file" 
        multiple 
        onChange={handleFileChange} 
        id="fileInput" 
        style={{ display: 'none' }}
      />
      <label htmlFor="fileInput" style={buttonStyle}>Choose Files</label>
      <button style={buttonStyle} onClick={handleUpload}>Upload</button>
  
      {/* Add the checkboxes here */}
      <div>
        {categories.map((category, index) => (
    <div key={index} style={categoryStyle}>
    <input 
              type="checkbox" 
              id={`category-${index}`} 
              name={category} 
              onChange={handleCategoryChange}
              style={buttonStyle}
            />
      <label htmlFor={`category-${index}`} style={{ color: '#000000' }}>{category}</label>
          </div>
        ))}
      </div>
  
      <div style={{ marginTop: '20px' }}>
        <progress value={uploadProgress} max="100" style={{ width: '50%', height: '20px', borderRadius: '10px', overflow: 'hidden' }} />
      </div>
      {uploadSuccess && <p style={{ color: 'green' }}>Upload successful!</p>}
{hasError && uploadErrors.map((error, index) => (
  <p key={index} style={{ color: 'red' }}>{error}</p> // Display the error messages in red
))}     <div>
        <h2 style={{ marginTop: '20px' }}>Uploaded files:</h2>
        {uploadedFiles.map((file, index) => (
  <div key={index} style={uploadedFileStyle}>
    <h2 style={{ color: '#0000FF' }}>File: {file.fileName}</h2>
    <p>Group: {file.group}</p>
  </div>
))}
      </div>
    </div>
  );
}