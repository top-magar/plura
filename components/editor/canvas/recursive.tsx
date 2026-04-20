"use client";

import type { ReactNode } from "react";
import type { El } from "../core/types";
import ContainerElement from "./container";
import TextElement from "./elements/text";
import LinkElement from "./elements/link";
import ButtonElement from "./elements/button";
import ImageElement from "./elements/image";
import VideoElement from "./elements/video";
import DividerElement from "./elements/divider";
import SpacerElement from "./elements/spacer";
import QuoteElement from "./elements/quote";
import ListElement from "./elements/list";
import CodeElement from "./elements/code";
import IconElement from "./elements/icon";
import BadgeElement from "./elements/badge-el";
import AccordionElement from "./elements/accordion-el";
import CountdownElement from "./elements/countdown-el";
import TabsElement from "./elements/tabs-el";
import NavbarElement from "./elements/navbar";
import EmbedElement from "./elements/embed";
import SocialIconsElement from "./elements/social-icons";
import MapElement from "./elements/map-el";
import GalleryElement from "./elements/gallery";
import ContactFormElement from "./elements/contact-form";
import PaymentFormElement from "./elements/payment-form";

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
