import { reviews } from "@/lib/site";

// Recenzii reale, DOAR cu acordul autorilor. Lista din lib/site.ts este goală
// ([DE COMPLETAT: recenzii reale]), deci secțiunea nu apare până când clientul le furnizează.
export function Reviews() {
  if (reviews.length === 0) return null;

  return (
    <section className="section section--alt" aria-labelledby="recenzii-titlu">
      <div className="container" data-reveal>
        <div className="section__header">
          <p className="eyebrow">Recenzii</p>
          <h2 id="recenzii-titlu">Ce spun clienții noștri</h2>
        </div>
        <ul className="grid grid--3">
          {reviews.map((review) => (
            <li key={review.author + review.source} className="card">
              <blockquote className="quote">
                <p>„{review.text}”</p>
              </blockquote>
              <p className="card__text">
                {review.author} · {review.source}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
