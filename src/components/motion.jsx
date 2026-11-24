/**
 * Fades a section in as it scrolls into view. Pure CSS (see .reveal in globals.css): the content is in the HTML and
 * visible without JavaScript, so it never delays the first paint. `delay` is kept for older call sites.
 */
export function Reveal({ children, className, delay }) {
  return (
    <div className={className ? `reveal ${className}` : "reveal"} style={delay ? { animationDelay: `${delay}s` } : undefined}>
      {children}
    </div>
  );
}
