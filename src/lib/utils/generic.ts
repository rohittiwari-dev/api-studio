export const scrollToSection = (index: string) => {
  if (window.document) {
    const ele = window?.document.getElementById(index);

    if (ele) {
      ele.scrollIntoView({
        behavior: "smooth",
        inline: "start",
        block: "start",
      });
    }
  }
};
