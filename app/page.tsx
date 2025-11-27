import Hero from '@/components/Hero'
import Skills from '@/components/Skills'
import Courses from '@/components/Courses'
import Achievements from '@/components/Achievements'
import Videos from '@/components/Videos'
import Gallery from '@/components/Gallery'
import Certificates from '@/components/Certificates'
import Career from '@/components/Career'
import Contact from '@/components/Contact'
import CoffeeAnimation from '@/components/CoffeeAnimation'

export default function Home() {
  return (
    <main className="min-h-screen bg-coffee-light">
      <CoffeeAnimation />
      <Hero />
      <section id="skills">
        <Skills />
      </section>
      <section id="courses">
        <Courses />
      </section>
      <section id="achievements">
        <Achievements />
      </section>
      <section id="videos">
        <Videos />
      </section>
      <section id="gallery">
        <Gallery />
      </section>
      <section id="certificates">
        <Certificates />
      </section>
      <section id="career">
        <Career />
      </section>
      <section id="contact">
        <Contact />
      </section>
    </main>
  )
}