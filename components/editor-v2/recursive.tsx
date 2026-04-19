'use client';

import React from 'react';
import type { EditorElement } from './types';
import TextComponent from './editor-components/text';
import Container from './editor-components/container';
import VideoComponent from './editor-components/video';
import LinkComponent from './editor-components/link-component';
import ContactFormComponent from './editor-components/contact-form';
import CheckoutComponent from './editor-components/checkout';
import ImageComponent from './editor-components/image-component';

const CONTAINER_TYPES = new Set(['__body', 'container', 'section', '2Col', '3Col', '4Col']);

export default function Recursive({ element }: { element: EditorElement }) {
  if (CONTAINER_TYPES.has(element.type)) {
    return <Container element={element} />;
  }

  switch (element.type) {
    case 'text':
      return <TextComponent element={element} />;
    case 'link':
    case 'button':
      return <LinkComponent element={element} />;
    case 'video':
      return <VideoComponent element={element} />;
    case 'image':
      return <ImageComponent element={element} />;
    case 'contactForm':
      return <ContactFormComponent element={element} />;
    case 'paymentForm':
      return <CheckoutComponent element={element} />;
    default:
      return null;
  }
}
