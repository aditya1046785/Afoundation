export async function uploadImageToCloudinary(file: File): Promise<string> {
  const sigRes = await fetch("/api/upload", { method: "GET" });
  const sigData = await sigRes.json();

  if (!sigData?.success || !sigData?.data) {
    throw new Error("Could not fetch upload signature");
  }

  const { signature, timestamp, cloudName, apiKey, folder } = sigData.data;
  const uploadFormData = new FormData();
  uploadFormData.append("file", file);
  uploadFormData.append("signature", signature);
  uploadFormData.append("timestamp", String(timestamp));
  uploadFormData.append("api_key", apiKey);
  uploadFormData.append("folder", folder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: uploadFormData,
  });

  const uploadedFile = await uploadRes.json();
  if (!uploadedFile?.secure_url) {
    throw new Error("Cloudinary upload failed");
  }

  return uploadedFile.secure_url as string;
}
