// simple helper to open the oauth popup and listen for message from backend
export function openGoogleAuthPopup(authorizeUrl) {
  return new Promise((resolve, reject) => {
    const width = 600;
    const height = 700;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2.5;
    const features = `width=${width},height=${height},left=${left},top=${top},resizable,scrollbars=yes,status=1`;
    const popup = window.open(authorizeUrl, "google_oauth_popup", features);
    if (!popup) {
      reject("Popup blocked");
      return;
    }

    function onMessage(e) {
      // Only accept messages from your backend origin
      if (e.origin !== "http://localhost:8080") return;
      const { token, user, error } = e.data || {};
      if (token) {
        window.removeEventListener("message", onMessage);
        resolve({ token, user });
      } else if (error) {
        window.removeEventListener("message", onMessage);
        reject(error);
      }
    }

    window.addEventListener("message", onMessage);

    // optional: poll for popup closed
    const interval = setInterval(() => {
      if (popup.closed) {
        clearInterval(interval);
        window.removeEventListener("message", onMessage);
        reject("Popup closed by user");
      }
    }, 500);
  });
}
