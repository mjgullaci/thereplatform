import { Link } from 'react-router-dom';
import driftlessIcon from '../assets/logo/driftless-icon.svg';

const WAITLIST_MAILTO =
  'mailto:mjgullaci@gmail.com' +
  '?subject=' +
  encodeURIComponent('driftless — early list') +
  '&body=' +
  encodeURIComponent(
    "i'd like to know when driftless opens up. (no info needed beyond the email this is sent from.)",
  );

export function Home() {
  return (
    <div className="page">
      <header className="hero">
        <div className="container hero__inner drift-in">
          <div className="hero__mark" aria-hidden="true">
            <img src={driftlessIcon} alt="" width={168} height={168} />
          </div>
          <span className="hero__eyebrow">driftless</span>
          <h1 className="hero__title">
            focus, <em>gently</em>.
          </h1>
          <p className="hero__sub">
            calm, short-session focus games. made for adults with ADHD brains.
          </p>
          <Link to="/focus" className="hero__cta press">
            try focus loop
          </Link>
          <p className="hero__caption">no signup. just one quiet thing at a time.</p>
        </div>
      </header>

      <section className="section section--soft">
        <div className="container">
          <h2 className="section__title">made for how ADHD brains like to play.</h2>
          <p className="section__lede">
            short sessions, soft visuals, no streaks to keep, no exclamation marks.
            here's how it feels.
          </p>
          <ul className="principle">
            <li className="principle__item">
              <h3 className="principle__name">one thing at a time.</h3>
              <p className="principle__body">
                every screen has one focal point. the apricot circle is the only
                thing asking for your attention.
              </p>
            </li>
            <li className="principle__item">
              <h3 className="principle__name">staying with it.</h3>
              <p className="principle__body">
                sessions are minutes, not hours. when you wander off mid-task — and
                you will — the app doesn't punish you for coming back.
              </p>
            </li>
            <li className="principle__item">
              <h3 className="principle__name">not now is a valid answer.</h3>
              <p className="principle__body">
                everything has a soft way out. "pick something smaller" instead of
                "you failed." no badges, no shame, no streaks to defend.
              </p>
            </li>
          </ul>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="founder">
            <div className="founder__mark" aria-hidden="true">
              <img src={driftlessIcon} alt="" width={56} height={56} />
            </div>
            <blockquote className="founder__quote">
              i have severe, diagnosed, medicated ADHD. i made driftless because every
              focus app i tried was either a clinical lecture or a slot machine. this
              is the one i want to use.
              <span className="founder__by">— matthew, founder</span>
            </blockquote>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="waitlist">
            <h2 className="waitlist__title">give it a try.</h2>
            <p className="waitlist__sub">
              this is an early build — rough edges and all. tell me what feels good
              and what's annoying.
            </p>
            <Link to="/focus" className="waitlist__cta press">
              open focus loop
            </Link>
          </div>
        </div>
      </section>

      <footer className="footer">
        <p>driftless · a hearthword games project · v0.1</p>
        <div className="footer__row">
          <a href="/about">about</a>
          <a href="/privacy">privacy</a>
          <a href={WAITLIST_MAILTO}>contact</a>
        </div>
        <p>made for ADHD brains. not a medical device. 18+.</p>
      </footer>
    </div>
  );
}
