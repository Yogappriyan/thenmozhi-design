import React from 'react';

const StaticPage = ({ title, children }: { title: string, children: React.ReactNode }) => (
  <div className="max-w-4xl mx-auto px-4 py-32 space-y-12">
    <h1 className="text-5xl md:text-7xl font-serif text-center">{title}</h1>
    <div className="prose prose-sm max-w-none text-gray-500 font-light leading-relaxed tracking-wide space-y-6">
      {children}
    </div>
  </div>
);

export const About = () => (
  <StaticPage title="About Us">
    <p>Thenmozhi Designs a home grown brand launched in 2018 aims at offering a fantastic blend of style, fashion, colours and quality. Our products are our strength and our moto is to make our customers fall in love with every product. We want every customer of ours to visualize the next door look and relate themselves to the overall styling. We will continually strive to bring in the "Wow" factor in every product that we create and curate</p>

<p>Thenmozhi Designs began as an Instagram-based business with just handloom cotton sarees. Sindhu Rajaram launched this handloom-focused brand in 2018, following her love for colors and passion for the art of curation. Sindhu's love for sarees had its origin from her grand mother and mother as any other little girl. Brand is named after her beautiful working mother who inspired the little girl with her colour combinations and pretty cotton sarees until her retirement</p>

Soon after, with Sindhu's unwavering commitment and passion, coupled by the finest quality handloom sarees, the brand was recognized for its quality and curation

<p>During this time, in 2021, we welcomed Dhivyaa Rajaram, Sindhu's elder sister into the brand. Her love and dedication for the brand led her to make the difficult decision to leave a high-level corporate career and join hands with Sindhu to make Thenmozhi Designs a family affair. Dhivyaa, with her corporate experience and ability, was able to streamline processes and brought in effective strategies, resulting in improved performance</p>

<p>Growing in strength, the brand diversified products and expanded its product lines, adding salwar sets, kurtas and the hand hand-picked Kanjivaram Silk sarees for the most memorable days of our life</p>

<p>Thenmozhi Designs grew as a well trusted brand, well-received by its 550K+ Instagram followers, stands a testimony</p>

<p>Thenmozhi Designs promises to deliver a good shopping experience along with our best and personally handpicked products. We take great care to touch, feel and test every product of Thenmozhi Designs; each product is a result of long discussions followed by testing of multiple colour combinations and exploring diverse fabrics. Each product has a story to tell and each product is created with lot of love</p>

<p>With Love
Thenmozhi Designs</p>
    <p>Our curated collections are meticulously selected to represent the finest craftsmanship from across India, ensuring each piece tells a story of heritage.</p>
  </StaticPage>
);

export const Shipping = () => (
  <StaticPage title="Shipping Policy">
    <p>We offer free standard shipping across India. Orders are typically processed within 2-3 business days.</p>
    <p>Once shipped, you will receive a tracking number to monitor your package via our "Track Order" portal.</p>
  </StaticPage>
);

export const Returns = () => (
  <StaticPage title="Returns & Exchanges">
    <p>Due to the boutique nature of our collections, we offer exchanges for size issues within 7 days of delivery.</p>
    <p>Items must be unworn, with all original tags and packaging intact. Please contact us via WhatsApp for return requests.</p>
  </StaticPage>
);
