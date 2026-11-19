/* The oversized outline numeral behind a plate. Decorative only: aria-hidden,
   and the same number is printed in the kicker, so nothing is lost when the
   scramble is switched off. */
export default function PlateNum({ n, className }: { n: string; className?: string }) {
  return (
    <span className={className ? `plate-num ${className}` : 'plate-num'} data-decode aria-hidden="true">
      {n}
    </span>
  );
}
