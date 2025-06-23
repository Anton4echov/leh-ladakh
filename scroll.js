  document.addEventListener('DOMContentLoaded', () => {
    const gallery = document.querySelector('.gallery');
    
    function autoScrollGallery() {
      const scrollDistance = 160; // slightly more than one image width (150 + 10 gap)
      gallery.scrollBy({ left: scrollDistance, behavior: 'smooth' });

      setTimeout(() => {
        gallery.scrollBy({ left: -scrollDistance, behavior: 'smooth' });
      }, 2000);
    }

    // Run once when visible
    const observer = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting) {
        autoScrollGallery();
        observer.disconnect();
      }
    }, { threshold: 0.5 });

    observer.observe(gallery);
  });
