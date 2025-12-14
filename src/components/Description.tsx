"use client";

function htmlToText(html: string) {
  const text = new DOMParser().parseFromString(html, "text/html").body.textContent;
  return text;
}

type DescriptionProps = {
  className?: string;
  description: string;
  children?: React.ReactNode;
};

export default function Description({
  className,
  description,
  children,
}: DescriptionProps) {

  return (
    <p className={className}>
      {htmlToText(description)}
      {children}
    </p>
  );
}
