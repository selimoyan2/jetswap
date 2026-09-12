import React from 'react'

export function WebSiteJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'JetSwap',
    alternateName: ['JetSwap Global', 'JetSwap Türkiye'],
    url: 'https://jetswap.com.tr',
    description: 'Para Trafiği Olmayan Küresel Takas Platformu. %100 Nakitsiz Eşyadan Eşyaya Takas.',
    inLanguage: ['tr-TR', 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: 'https://jetswap.com.tr/?q={search_term_string}',
      'query-input': 'required name=search_term_string'
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

export function OrganizationJsonLd() {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'JetSwap',
    url: 'https://jetswap.com.tr',
    logo: 'https://jetswap.com.tr/globe.svg',
    description: 'Küresel ölçekte sıfır nakit kuralıyla çalışan, yapay zeka eşleştirmeli döngüsel takas ağı.',
    knowsAbout: [
      'Barter trading',
      'Peer to peer barter',
      'Circular economy',
      'Zero-waste',
      'Eşya takası',
      'Takas ekonomisi'
    ]
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface FaqItem {
  question: string
  answer: string
}

export function FaqJsonLd({ faqs }: { faqs: FaqItem[] }) {
  if (!faqs || faqs.length === 0) return null

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}

interface ArticleJsonLdProps {
  title: string
  description: string
  url: string
  publishedAt: string
  authorName: string
  imageUrl: string
}

export function ArticleJsonLd({
  title,
  description,
  url,
  publishedAt,
  authorName,
  imageUrl
}: ArticleJsonLdProps) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: title,
    description: description,
    image: imageUrl,
    datePublished: publishedAt,
    dateModified: publishedAt,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url
    },
    author: {
      '@type': 'Person',
      name: authorName
    },
    publisher: {
      '@type': 'Organization',
      name: 'JetSwap',
      logo: {
        '@type': 'ImageObject',
        url: 'https://jetswap.com.tr/globe.svg'
      }
    }
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  )
}
