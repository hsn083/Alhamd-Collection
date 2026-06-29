import Header from '@/components/Header';
import Footer from '@/components/Footer';

const faqs = [
  {
    q: 'What is AlhamdCollection?',
    a: "AlhamdCollection is Pakistan's premier destination for premium clothing, shoes, and fashion accessories. We offer a wide range of stylish products with fast delivery across Pakistan.",
  },
  {
    q: 'Do you offer Cash on Delivery (COD)?',
    a: 'Yes! We offer Cash on Delivery across all major cities in Pakistan. You can also pay via EasyPaisa, JazzCash, or bank transfer.',
  },
  {
    q: 'How long does delivery take?',
    a: 'Standard delivery takes 3–5 business days. Express delivery is available in 1–2 business days for an additional fee.',
  },
  {
    q: 'What is your return policy?',
    a: 'We offer a 7-day hassle-free return policy. If you are not satisfied with your purchase, contact us within 7 days of delivery for a return or exchange.',
  },
  {
    q: 'Are your products authentic?',
    a: 'Yes, all products at AlhamdCollection are 100% authentic. We source directly from trusted suppliers and quality-check every item.',
  },
  {
    q: 'What sizes are available?',
    a: 'We offer a wide range of sizes for both men and women. Size guides are available on each product page to help you find the perfect fit.',
  },
  {
    q: 'Do you ship to all cities in Pakistan?',
    a: 'Yes, we deliver nationwide — from Karachi to Peshawar and everywhere in between.',
  },
  {
    q: 'What is the warranty on shoes?',
    a: 'Most footwear comes with a 3–6 month manufacturing defect warranty. Specific warranty information is listed on each product page.',
  },
  {
    q: 'Can I exchange a product for a different size?',
    a: 'Absolutely! Size exchanges are available within 7 days. Contact our customer service team and we will arrange the exchange for you.',
  },
  {
    q: 'How do I track my order?',
    a: 'Once your order is shipped, you will receive an SMS/email with your tracking number. You can also track your order in the My Orders section of your account.',
  },
];

export default function FAQPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Frequently Asked Questions</h1>
            <p className="text-xl text-emerald-100">Everything you need to know about AlhamdCollection</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4 max-w-3xl">
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-start gap-2">
                    <span className="text-emerald-600 font-bold">Q.</span>
                    {faq.q}
                  </h3>
                  <p className="text-gray-600 text-sm leading-relaxed pl-5">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
