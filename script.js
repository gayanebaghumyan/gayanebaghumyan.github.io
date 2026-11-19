async function copyText(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }

  const temporaryField = document.createElement("textarea");
  temporaryField.value = text;
  temporaryField.setAttribute("readonly", "");
  temporaryField.style.position = "fixed";
  temporaryField.style.opacity = "0";
  document.body.appendChild(temporaryField);
  temporaryField.select();

  const copied = document.execCommand("copy");
  temporaryField.remove();

  if (!copied) {
    throw new Error("Copy command was not available.");
  }
}

const emailButton = document.querySelector(".email-copy");
const emailTooltip = document.querySelector("#email-tooltip");

if (emailButton && emailTooltip) {
  const emailAddress = emailButton.dataset.email;
  let resetMessage;

  emailButton.addEventListener("click", async () => {
    window.clearTimeout(resetMessage);

    try {
      await copyText(emailAddress);
      emailTooltip.textContent = `Copied: ${emailAddress}`;
      emailButton.classList.add("is-copied");
    } catch {
      emailTooltip.textContent = emailAddress;
    }

    resetMessage = window.setTimeout(() => {
      emailTooltip.textContent = emailAddress;
      emailButton.classList.remove("is-copied");
    }, 1800);
  });
}

document.querySelectorAll(".address-copy").forEach((addressButton) => {
  const address = addressButton.dataset.address;
  const tooltip = addressButton.querySelector(".address-tooltip");
  const feedback = tooltip ?? addressButton.nextElementSibling;
  const defaultMessage = feedback?.textContent ?? "";
  let resetMessage;

  addressButton.addEventListener("click", async () => {
    window.clearTimeout(resetMessage);

    try {
      await copyText(address);
      if (feedback) feedback.textContent = tooltip ? `Copied: ${address}` : "Copied";
    } catch {
      if (feedback) feedback.textContent = tooltip ? `Copy failed: ${address}` : "Copy failed";
    }

    if (tooltip) addressButton.classList.add("has-copy-feedback");
    resetMessage = window.setTimeout(() => {
      if (feedback) feedback.textContent = defaultMessage;
      if (tooltip) addressButton.classList.remove("has-copy-feedback");
    }, 1800);
  });
});
