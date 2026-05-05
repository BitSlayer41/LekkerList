import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import "./Home.css";

// Import Icons
import Car from "../../emoji/car.png";
import Electronics from "../../emoji/electronic-devices.png";
import Fashion from "../../emoji/woman-clothes.png";
import House from "../../emoji/house.png";
import Music from "../../emoji/electric-guitar.png";
import Sport from "../../emoji/sport.png";
import Clipboard from "../../emoji/clipboard.png";
import Message from "../../emoji/comments.png";
import CreditCard from "../../emoji/contactless.png";
import Truck from "../../emoji/delivery.png";
import Star from "../../emoji/star.png";
import Verified from "../../emoji/verified.png";

const CATEGORIES = [
  { icon: Car, name: "Car Parts" },
  { icon: Electronics, name: "Electronics" },
  { icon: Fashion, name: "Fashion" },
  { icon: House, name: "Home & Garden" },
  { icon: Music, name: "Music" },
  { icon: Sport, name: "Sport & Fitness" },
];

const STEPS = [
  {
    icon: Clipboard,
    color: "orange",
    num: "01",
    title: "List your product",
    desc: "Add photos, set your price, and go live in under 2 minutes. It's completely free.",
  },
  {
    icon: Message,
    color: "teal",
    num: "02",
    title: "Connect with buyers",
    desc: "Chat directly with interested buyers through our built-in messaging system.",
  },
  {
    icon: CreditCard,
    color: "orange",
    num: "03",
    title: "Get paid securely",
    desc: "Accept payments safely with our secure checkout. Funds land in your account fast.",
  },
  {
    icon: Truck,
    color: "teal",
    num: "04",
    title: "Delivery",
    desc: "Arrange delivery - Flexible options to suit every transactions.",
  },
];

const TRUST = [
  {
    num: "100%",
    label: "Secure Payments",
  },
  {
    num: "24/7",
    label: "Seller Support",
  },
  {
    num: "0%",
    label: "Hidden Fees",
  },
  {
    num: "R0",
    label: "Free to List",
  },
];

const CREDITS = [
  {
    href: "https://www.flaticon.com/free-icons/car",
    title: "car icons",
    label: "Car - Konkapp",
  },
  {
    href: "https://www.flaticon.com/free-icons/electronic-devices",
    title: "electronic devices icons",
    label: "Electronics - Dewi Sari",
  },
  {
    href: "https://www.flaticon.com/free-icons/dress",
    title: "dress icons",
    label: "Fashion - DinosoftLabs",
  },
  {
    href: "https://www.flaticon.com/free-icons/home",
    title: "home icons",
    label: "Home - Vectors Market",
  },
  {
    href: "https://www.flaticon.com/free-icons/electric-guitar",
    title: "electric guitar icons",
    label: "Music - Freepik",
  },
  {
    href: "https://www.flaticon.com/free-icons/sport",
    title: "sport icons",
    label: "Sport - Freepik",
  },
  {
    href: "https://www.flaticon.com/free-icons/clipboard",
    title: "clipboard icons",
    label: "Clipboard - Freepik",
  },
  {
    href: "https://www.flaticon.com/free-icons/message",
    title: "message icons",
    label: "Message - Freepik",
  },
  {
    href: "https://www.flaticon.com/free-icons/credit-card",
    title: "credit card icons",
    label: "Credit card - juicy_fish",
  },
  {
    href: "https://www.flaticon.com/free-icons/truck",
    title: "truck icons",
    label: "Truck - Freepik",
  },
  {
    href: "https://www.flaticon.com/free-icons/star",
    title: "star icons",
    label: "Star - Pixel perfect",
  },
  {
    href: "https://www.flaticon.com/free-icons/verified-emoji-keyboard",
    title: "verified emoji keyboard icons",
    label: "Verified - Rizki Ahmad Fauzi",
  },
  {
    href: "https://www.flaticon.com/free-icons/box",
    title: "box icons",
    label: "Box - Good Ware",
  },
  {
    href: "https://www.flaticon.com/free-icons/shopping-cart",
    title: "shopping cart icons",
    label: "Shopping cart - Freepik",
  },
  {
    href: "https://www.flaticon.com/free-icons/google-maps",
    title: "google maps icons",
    label: "Google maps - Smashicons",
  },
];

export default function Home() {
  const authData = useSelector((state) => state.authentication?.authData);
  const userInfo = authData?.user ?? null;
  const isSeller = userInfo?.role === "seller" || userInfo?.role === "admin";

  return (
    <div className="homePage">
      {/* Hero */}
      <section className="hero">
        <div className="heroBgCircle c1" />
        <div className="heroBgCircle c2" />

        <div className="heroContent">
          <div className="heroTag">
            <span className="heroPulse" />
            Mzansi's Marketplace
          </div>

          <h1>
            Buy &amp; Sell
            <br />
            the <span className="accentOrange">Lekker</span>
            <br />
            <span className="accentTeal">Way</span>
          </h1>

          <p className="heroSub">
            South Africa's freshest marketplace. Find unique products from local
            sellers, or turn your passion into profit.
          </p>

          <div className="heroActions">
            <Link to="/browseProducts" className="btnPrimary">
              Browse Products
            </Link>

            {isSeller ? (
              <Link to="/addProduct" className="btnSecondary">
                Add a Listing
              </Link>
            ) : (
              <a
                href="http://localhost/LekkerList/backend/pages/register.html"
                className="btnSecondary"
              >
                Start Selling
              </a>
            )}
          </div>

          <div className="statsBar">
            <div className="statItem">
              <div className="statNum">
                2.4<span>K+</span>
              </div>
              <div className="statLabel">Active Listings</div>
            </div>

            <div className="statItem">
              <div className="statNum">
                840<span>+</span>
              </div>
              <div className="statLabel">Local Sellers</div>
            </div>

            <div className="statItem">
              <div className="statNum">
                R12<span>M+</span>
              </div>
              <div className="statLabel">In Sales</div>
            </div>
          </div>
        </div>

        {/* Floating Cards */}
        <div className="heroFloat">
          <div className="floatCard">
            <div className="floatAvatar orange">
              <img src={Electronics} alt="Electronics" className="emoji" />
            </div>
            <div className="floatText">
              <div className="ftTitle">Specialised in Electronics</div>
              <div className="ftSub">Best second-hand electronics</div>
            </div>
          </div>

          <div className="floatCard delay1">
            <div className="floatAvatar teal">
              <img src={Verified} alt="Verified" className="emoji" />
            </div>
            <div className="floatText">
              <div className="ftTitle">Verified Sellers</div>
              <div className="ftSub">We have what you are looking for!</div>
            </div>
          </div>

          <div className="floatCard delay2">
            <div className="floatAvatar orange">
              <img src={Star} alt="Star" className="emoji" />
            </div>
            <div className="floatText">
              <div className="ftTitle">5-star review</div>
              <div className="ftSub">"Absolutely lekker!"</div>
            </div>
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="categoriesSection">
        <div className="sectionTag">Shop by Category</div>
        <div className="sectionTitle">What are you looking for?</div>

        <div className="catGrid">
          {CATEGORIES.map((cat) => (
            <Link
              to={`/browseProducts?category=${encodeURIComponent(cat.name)}`}
              key={cat.name}
              className="catCard"
            >
              <span className="catIcon">
                <img src={cat.icon} alt={cat.name} className="emoji" />
              </span>
              <div className="catName">{cat.name}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Trust */}
      <div className="trustBar">
        {TRUST.map((t) => (
          <div key={t.label} className="trustItem">
            <div className="trustNum">{t.num}</div>
            <div className="trustLabel">{t.label}</div>
          </div>
        ))}
      </div>

      {/* How it works */}
      <section className="howSection">
        <div className="sectionTag">How It Works</div>
        <div className="sectionTitle">Simple as a braai</div>

        <div className="stepsGrid">
          {STEPS.map((s) => (
            <div key={s.num} className="step">
              <div className={`stepIcon ${s.color}`}>
                <img src={s.icon} alt={s.title} className="emoji" />
              </div>
              <div className="stepNum">{s.num}</div>
              <div className="stepTitle">{s.title}</div>
              <div className="stepDesc">{s.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="ctaSection">
        <div className="ctaBg" />
        <h2>
          Ready to sell something <span className="accentOrange">lekker?</span>
        </h2>

        <p>
          Join thousands of South Africans already buying and selling on
          LekkerList.
        </p>

        {userInfo ? (
          <Link to="/browseProducts" className="btnPrimary">
            Start Browsing
          </Link>
        ) : (
          <a
            href="http://localhost/LekkerList/backend/pages/register.html"
            className="btnPrimary"
          >
            Create A Free Account
          </a>
        )}
      </section>

      {/* Credits */}
      <div className="credits">
        <p>Icons by:</p>
        {CREDITS.map((c) => (
          <a
            key={c.href}
            href={c.href}
            title={c.title}
            target="_blank"
            rel="noreferrer"
          >
            {c.label}
          </a>
        ))}
        <span>
          All icons from{" "}
          <a href="https://www.flaticon.com" target="_blank" rel="noreferrer">
            FLatIcon
          </a>
        </span>
      </div>
    </div>
  );
}
