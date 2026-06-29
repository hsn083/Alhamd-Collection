import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

const blogPosts = [
  {
    id: 1,
    title: 'Top Fashion Trends for 2024',
    category: 'Style Guide',
    date: 'June 15, 2024',
    excerpt: 'Discover the hottest fashion trends of 2024 that are dominating runways and street style around the world.',
    readTime: '5 min read',
  },
  {
    id: 2,
    title: 'How to Style Your Wardrobe for Every Season',
    category: 'Tips & Tricks',
    date: 'June 10, 2024',
    excerpt: 'Build a versatile wardrobe that works year-round with our expert styling tips for every season.',
    readTime: '7 min read',
  },
  {
    id: 3,
    title: 'The Ultimate Shoe Guide for Men',
    category: 'Footwear',
    date: 'June 5, 2024',
    excerpt: 'From formal leather shoes to casual sneakers, here is everything you need to know about men\'s footwear.',
    readTime: '6 min read',
  },
  {
    id: 4,
    title: 'Women\'s Fashion Essentials Under PKR 5000',
    category: 'Budget Fashion',
    date: 'May 28, 2024',
    excerpt: 'Look amazing without breaking the bank. Our top picks for premium women\'s fashion at affordable prices.',
    readTime: '4 min read',
  },
];

export default function BlogPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gray-50">
        <section className="bg-gradient-to-r from-emerald-700 to-teal-700 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-4xl font-bold mb-4">Fashion Blog</h1>
            <p className="text-xl text-emerald-100">Style tips, trends, and fashion inspiration</p>
          </div>
        </section>

        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
              {blogPosts.map((post) => (
                <Card key={post.id} className="hover:shadow-lg transition-shadow border border-gray-100 bg-white">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <Badge className="bg-emerald-100 text-emerald-700">{post.category}</Badge>
                      <span className="text-xs text-gray-400">{post.readTime}</span>
                    </div>
                    <h2 className="text-xl font-bold mb-3 text-gray-900 hover:text-emerald-700 cursor-pointer transition-colors">
                      {post.title}
                    </h2>
                    <p className="text-gray-600 text-sm leading-relaxed mb-4">{post.excerpt}</p>
                    <div className="text-xs text-gray-400">{post.date}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
