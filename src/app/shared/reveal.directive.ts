import { Directive, ElementRef, OnDestroy, afterNextRender, inject, input } from '@angular/core';

/**
 * Scroll-reveal: the element slides in from the side once it enters the viewport.
 * Adds `.reveal` immediately and `.is-visible` when it intersects; styling lives in `styles.css`
 * (respects prefers-reduced-motion). Stagger siblings with `style="--i: n"` / `[style.--i]="n"`.
 *
 *   <div appReveal>...</div>                         slides in from the left (default)
 *   <div appReveal="right">...</div>                 slides in from the right
 *   <li [appReveal]="$even ? 'left' : 'right'">      alternate
 */
@Directive({
  selector: '[appReveal]',
  host: {
    class: 'reveal',
    '[class.reveal-right]': "from() === 'right'",
  },
})
export class RevealDirective implements OnDestroy {
  /** Side the element slides in from. Empty attribute = left. */
  readonly from = input<'left' | 'right' | ''>('', { alias: 'appReveal' });

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
