import { Directive, ElementRef, OnDestroy, afterNextRender, inject } from '@angular/core';

/**
 * Scroll-reveal: adds `.reveal` immediately and `.is-visible` once the element enters the viewport.
 * Styling lives in `styles.css` (and respects prefers-reduced-motion). Children can stagger with
 * `style="--i: n"`.
 *
 *   <section appReveal> ... </section>
 */
@Directive({
  selector: '[appReveal]',
  host: { class: 'reveal' },
})
export class RevealDirective implements OnDestroy {
  private readonly el = inject<ElementRef<HTMLElement>>(ElementRef);
  private observer?: IntersectionObserver;

  constructor() {
    afterNextRender(() => {
      const node = this.el.nativeElement;
      if (typeof IntersectionObserver === 'undefined') {
        node.classList.add('is-visible');
        return;
      }
      this.observer = new IntersectionObserver(
        entries => {
          if (entries.some(e => e.isIntersecting)) {
            node.classList.add('is-visible');
            this.observer?.disconnect();
          }
        },
        { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
      );
      this.observer.observe(node);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
