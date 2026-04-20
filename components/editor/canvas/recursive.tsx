"use client";

import type { ReactNode } from "react";
import type { El } from "../core/types";
import ContainerElement from "./container";
import TextElement from "./text";
import LinkElement from "./link";
import ButtonElement from "./button";
import ImageElement from "./image";
import VideoElement from "./video";
import DividerElement from "./divider";
import SpacerElement from "./spacer";
import QuoteElement from "./quote";
import ListElement from "./list";
import CodeElement from "./code";
import IconElement from "./icon";
import BadgeElement from "./badge-el";
import AccordionElement from "./accordion-el";
import CountdownElement from "./countdown-el";
import TabsElement from "./tabs-el";
import NavbarElement from "./navbar";
import EmbedElement from "./embed";
import SocialIconsElement from "./social-icons";
import MapElement from "./map-el";
import GalleryElement from "./gallery";
import ContactFormElement from "./contact-form";
import PaymentFormElement from "./payment-form";

const CONTAINER_TYPES = new Set([
  "__body", "container", "section", "2Col", "3Col", "4Col",
  "row", "column", "grid", "hero", "footer", "header",
  "card", "sidebar", "modal", "form",
]);

export default function Recursive({ element }: { element: El }): ReactNode {
  if (CONTAINER_TYPES.has(element.type)) return <ContainerElement element={element} />;

  switch (element.type) {
    case "text": return <TextElement element={element} />;
    case "link": return <LinkElement element={element} />;
    case "button": return <ButtonElement element={element} />;
    case "image": return <ImageElement element={element} />;
    case "video": return <VideoElement element={element} />;
    case "divider": return <DividerElement element={element} />;
    case "spacer": return <SpacerElement element={element} />;
    case "quote": return <QuoteElement element={element} />;
    case "list": return <ListElement element={element} />;
    case "code": return <CodeElement element={element} />;
    case "icon": return <IconElement element={element} />;
    case "badge": return <BadgeElement element={element} />;
    case "accordion": return <AccordionElement element={element} />;
    case "countdown": return <CountdownElement element={element} />;
    case "tabs": return <TabsElement element={element} />;
    case "navbar": return <NavbarElement element={element} />;
    case "embed": return <EmbedElement element={element} />;
    case "socialIcons": return <SocialIconsElement element={element} />;
    case "map": return <MapElement element={element} />;
    case "gallery": return <GalleryElement element={element} />;
    case "contactForm": return <ContactFormElement element={element} />;
    case "paymentForm": return <PaymentFormElement element={element} />;
    default: return null;
  }
}
