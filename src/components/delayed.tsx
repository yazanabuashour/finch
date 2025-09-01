"use client";

import { useEffect, useState } from "react";

export function Delayed({
  children,
  ms = 200,
}: {
  children: React.ReactNode;
  ms?: number;
}) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const id = setTimeout(() => setShow(true), ms);
    return () => clearTimeout(id);
  }, [ms]);

  return show ? <>{children}</> : null;
}
