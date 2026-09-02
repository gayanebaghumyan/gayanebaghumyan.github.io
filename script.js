const emailButton = document.querySelector(".email-copy");
const emailTooltip = document.querySelector("#email-tooltip");

if (emailButton && emailTooltip) {
  const emailAddress = emailButton.dataset.email;
  let resetMessage;

  async function copyEmail() {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(emailAddress);
      return;
    }

    const temporaryField = document.createElement("textarea");
    temporaryField.value = emailAddress;
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

  emailButton.addEventListener("click", async () => {
    window.clearTimeout(resetMessage);

    try {
      await copyEmail();
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

