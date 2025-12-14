"use client";

function htmlToText(html: string) {
  const text = new DOMParser().parseFromString(html, "text/html").body.textContent;
  return text;
}

type TitleProps = {
  className?: string;
  title: string;
  children?: React.ReactNode;
};

export default function Title({ className, title, children }: TitleProps) {
  return (
    <h2 className={className}>
      {htmlToText(title)}
      {children}
    </h2>
  );
}
