import { useState } from "react";
import { MAX_REVIEW_NOTE, type Review } from "./model";
import type { Drink } from "./catalog";

export default function ReviewEditor({
  drink,
  review,
  onSave,
}: {
  drink: Drink;
  review?: Review;
  onSave: (review: Review) => void;
}) {
  const [rating, setRating] = useState(review?.rating ?? 0);
  const [note, setNote] = useState(review?.note ?? "");
  return (
    <form
      className="bb-panel bb-review-editor"
      onSubmit={(e) => {
        e.preventDefault();
        if (rating)
          onSave({
            drinkId: drink.id,
            rating,
            note,
            updatedAt: new Date().toISOString(),
          });
      }}
    >
      <h3>
        {review ? "Edit your review" : "How was your drink?"} · {drink.name}
      </h3>
      <fieldset className="bb-stars">
        <legend>Your rating</legend>
        <div>
          {[1, 2, 3, 4, 5].map((star) => (
            <label key={star} className={rating >= star ? "selected" : ""}>
              <input
                type="radio"
                name="drink-rating"
                value={star}
                checked={rating === star}
                onChange={() => setRating(star)}
                required
                aria-label={`${star} ${star === 1 ? "star" : "stars"}`}
              />
              <span aria-hidden="true">★</span>
            </label>
          ))}
        </div>
        <p className="bb-muted">
          {rating ? `${rating} out of 5 stars` : "Choose 1–5 stars"}
        </p>
      </fieldset>
      <label>
        Notes (optional)
        <textarea
          aria-label="Notes (optional)"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          maxLength={MAX_REVIEW_NOTE}
          rows={4}
          placeholder="What worked? What would you change next time?"
        />
      </label>
      <p className="bb-footnote">
        {note.length}/{MAX_REVIEW_NOTE} characters · Saved privately in this
        browser.
      </p>
      <button className="bb-primary" type="submit" disabled={!rating}>
        Save review
      </button>
    </form>
  );
}
