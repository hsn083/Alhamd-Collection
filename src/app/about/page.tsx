import Header from '@/components/Header';
import Footer from '@/components/Footer';

export default function AboutPage() {
  return (
    <>
      <Header />

      <main className="min-h-screen bg-gray-50">

        {/* Hero */}
        <section className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-20">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">
              About AlhamdCollection
            </h1>

            <p className="text-xl text-emerald-100 max-w-2xl mx-auto">
              Your trusted destination for premium clothing and footwear in Pakistan
            </p>
          </div>
        </section>


        {/* Story */}
        <section className="py-16">
          <div className="container mx-auto px-4 max-w-5xl">

            <div className="grid md:grid-cols-2 gap-12 items-center">

              <div>

                <span className="text-sm font-semibold text-emerald-600 tracking-widest uppercase">
                  Our Story
                </span>

                <h2 className="text-3xl font-bold mt-2 mb-4 text-gray-900">
                  Style Meets Comfort
                </h2>


                <p className="text-gray-600 mb-4 leading-relaxed">
                  Founded in 2024, AlhamdCollection was created with a vision
                  to bring stylish, high-quality, and affordable fashion to
                  customers across Pakistan.
                </p>


                <p className="text-gray-600 mb-4 leading-relaxed">
                  We believe that fashion is more than just clothing — it is a
                  way to express confidence, personality, and lifestyle. Our
                  journey started with a simple goal: to provide premium
                  clothing, footwear, and accessories that combine modern
                  designs with comfort and quality.
                </p>


                <p className="text-gray-600 leading-relaxed">
                  Today, AlhamdCollection offers a carefully selected range of
                  men's fashion, women's clothing, shoes, and accessories,
                  making it easier for everyone to find their perfect style
                  from the comfort of their home.
                </p>


              </div>



              {/* Mission */}
              <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-8 text-center">

                <div className="text-6xl mb-4">
                  
                </div>


                <h3 className="text-xl font-bold text-emerald-800 mb-3">
                  Our Mission
                </h3>


                <p className="text-gray-600 mb-4">
                  Fashion That Inspires Confidence
                </p>


                <ul className="text-gray-600 space-y-2 text-left">
                  <li>✨ Quality products</li>
                  <li>✨ Trendy and modern designs</li>
                  <li>✨ Affordable prices</li>
                  <li>✨ Smooth and reliable shopping experience</li>
                </ul>


              </div>

            </div>

          </div>
        </section>



        {/* Stats */}
        <section className="bg-white py-16">

          <div className="container mx-auto px-4">

            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center max-w-3xl mx-auto">

              {[
                { value: '500+', label: 'Fashion Styles' },
                { value: '1000+', label: 'Happy Customers' },
                { value: '8+', label: 'Categories' },
                { value: '24/7', label: 'Customer Support' },
              ].map((stat) => (

                <div key={stat.label}>

                  <div className="text-3xl font-bold text-emerald-700">
                    {stat.value}
                  </div>

                  <div className="text-sm text-gray-500 mt-1">
                    {stat.label}
                  </div>

                </div>

              ))}

            </div>

          </div>

        </section>




        {/* Why Choose Us */}
        <section className="py-16 bg-gray-50">

          <div className="container mx-auto px-4 max-w-5xl">


            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
              Why Choose Us
            </h2>



            <div className="grid md:grid-cols-3 gap-6">


              {[
                {
                  icon: '✅',
                  title: 'Authentic Products',
                  desc: 'Every item is carefully sourced and quality-checked before reaching you.'
                },

                {
                  icon: '🚚',
                  title: 'Fast Delivery',
                  desc: 'We deliver across Pakistan with quick and reliable service.'
                },

                {
                  icon: '🔄',
                  title: 'Easy Returns',
                  desc: 'Our hassle-free return policy keeps your shopping experience safe.'
                },

                {
                  icon: '🔒',
                  title: 'Secure Shopping',
                  desc: 'Your orders and information are protected with secure systems.'
                },

                {
                  icon: '⭐',
                  title: 'Premium Quality',
                  desc: 'We focus on quality products with modern designs.'
                },

                {
                  icon: '💯',
                  title: 'Customer Satisfaction',
                  desc: 'Your happiness is our top priority.'
                }

              ].map((item) => (

                <div
                  key={item.title}
                  className="bg-white rounded-xl p-6 text-center border border-emerald-100 hover:shadow-md transition"
                >

                  <div className="text-4xl mb-3">
                    {item.icon}
                  </div>


                  <h3 className="font-semibold text-gray-800 mb-2">
                    {item.title}
                  </h3>


                  <p className="text-sm text-gray-500">
                    {item.desc}
                  </p>


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