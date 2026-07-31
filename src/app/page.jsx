import Hero from '@/components/home/Hero';
import CategoryStrip from '@/components/home/CategoryStrip';
import FeaturedProducts from '@/components/home/FeaturedProducts';
import PromoBanner from '@/components/home/PromoBanner';
import CraftStory from '@/components/home/CraftStory';
import Testimonials from '@/components/home/Testimonials';
import BlogTeaser from '@/components/home/BlogTeaser';
import InstagramStrip from '@/components/home/InstagramStrip';
import { getAllProducts, getCategories, getPosts, getTestimonials } from '@/lib/data';

export const metadata = {
  title: 'Adelaide Furniture | Handcrafted timber furniture, made to keep'
};

export default async function HomePage() {
  const [products, categories, posts, testimonials] = await Promise.all([
    getAllProducts(),
    getCategories(),
    getPosts({ limit: 3 }),
    getTestimonials()
  ]);

  return (
    <>
      <Hero />
      <CategoryStrip categories={categories} />
      <FeaturedProducts products={products} />
      <PromoBanner />
      <CraftStory />
      <Testimonials testimonials={testimonials} />
      <BlogTeaser posts={posts} />
      <InstagramStrip />
    </>
  );
}
