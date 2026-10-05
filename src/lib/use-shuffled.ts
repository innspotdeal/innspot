"use client";

import { useEffect, useState } from "react";

// ترتيب عشوائي جديد مع كل رفرش. الصفحات متكاشة على السيرفر، فالخلط لازم يحصل
// في المتصفح بعد التحميل — أول رندر بالترتيب الأصلي عشان ميحصلش hydration mismatch
export function useShuffled<T>(items: T[]): T[] {
  const [shuffled, setShuffled] = useState(items);

  useEffect(() => {
    const copy = [...items];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    // eslint-disable-next-line react-hooks/set-state-in-effect -- الخلط لازم يستنى لحد ما الصفحة تتحمّل في المتصفح
    setShuffled(copy);
  }, [items]);

  return shuffled;
}
