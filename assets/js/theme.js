(() => {
  document.documentElement.classList.add('hf-js');

  const sticky = document.querySelector('[data-sticky-buy]');
  const buySection = document.querySelector('#buy');

  if (!sticky || !buySection) return;

  const updateSticky = () => {
    const buyTop = buySection.getBoundingClientRect().top + window.scrollY;
    const shouldShow = window.scrollY > Math.min(720, buyTop * 0.45) && window.scrollY < buyTop - 180;
    sticky.classList.toggle('is-visible', shouldShow);
  };

  updateSticky();
  window.addEventListener('scroll', updateSticky, { passive: true });
  window.addEventListener('resize', updateSticky);
})();
