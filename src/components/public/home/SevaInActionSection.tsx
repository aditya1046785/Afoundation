"use client";
import { useState, type KeyboardEvent } from "react";
import { homeManrope, homeGaramond } from "./homeFonts";
import styles from "./HomeDesign.module.css";
import Image from "next/image";

export function SevaInActionSection() {
  const [activeTab, setActiveTab] = useState("kitchen");
  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>) {
    const tabs = ["kitchen", "classrooms", "rescue", "temple"];
    const index = tabs.indexOf(activeTab);
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % tabs.length;
    else if (event.key === "ArrowLeft")
      next = (index + tabs.length - 1) % tabs.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = tabs.length - 1;
    else return;
    event.preventDefault();
    setActiveTab(tabs[next]);
    document.getElementById(`tab-btn-${tabs[next]}`)?.focus();
  }
  return (
    <section
      className={`${styles.section} ${homeManrope.variable} ${homeGaramond.variable} w-full py-20 bg-[#f6f3ee]`}
    >
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-[11px] leading-[14px] tracking-[0.06em] font-bold text-[#ab3600] uppercase tracking-wider">
            Ground Operations
          </span>
          <h2 className="font-[family-name:var(--font-home-heading)] text-[32px] leading-10 sm:text-5xl sm:leading-[56px] tracking-[-0.015em] font-semibold text-[#023727] mt-2">
            Seva in Action: Live Field Chronicles
          </h2>
          <p className="text-base leading-6 text-[#414944] mt-3">
            Explore photographic proof and real-time updates directly uploaded
            by our ground coordinators across Uttar Pradesh and Bihar.
          </p>

          <div
            role="tablist"
            aria-label="Seva field chronicles"
            className="mt-8 inline-flex p-1.5 bg-[#ebe8e3] rounded-[8px] overflow-x-auto max-w-full"
          >
            <button
              className={`px-4 py-2 rounded-[4px] text-xs leading-4 font-semibold transition-all ${activeTab === "kitchen" ? "bg-[#023727] text-white shadow-sm" : "text-[#414944] hover:text-[#023727]"}`}
              id="tab-btn-kitchen"
              type="button"
              role="tab"
              aria-selected={activeTab === "kitchen"}
              aria-controls="tab-kitchen"
              tabIndex={activeTab === "kitchen" ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab("kitchen")}
            >
              Magh Mela Kitchens
            </button>
            <button
              className={`px-4 py-2 rounded-[4px] text-xs leading-4 font-semibold transition-all ${activeTab === "classrooms" ? "bg-[#023727] text-white shadow-sm" : "text-[#414944] hover:text-[#023727]"}`}
              id="tab-btn-classrooms"
              type="button"
              role="tab"
              aria-selected={activeTab === "classrooms"}
              aria-controls="tab-classrooms"
              tabIndex={activeTab === "classrooms" ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab("classrooms")}
            >
              Smart Classrooms
            </button>
            <button
              className={`px-4 py-2 rounded-[4px] text-xs leading-4 font-semibold transition-all ${activeTab === "rescue" ? "bg-[#023727] text-white shadow-sm" : "text-[#414944] hover:text-[#023727]"}`}
              id="tab-btn-rescue"
              type="button"
              role="tab"
              aria-selected={activeTab === "rescue"}
              aria-controls="tab-rescue"
              tabIndex={activeTab === "rescue" ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab("rescue")}
            >
              Gaushala Rescue Van
            </button>
            <button
              className={`px-4 py-2 rounded-[4px] text-xs leading-4 font-semibold transition-all ${activeTab === "temple" ? "bg-[#023727] text-white shadow-sm" : "text-[#414944] hover:text-[#023727]"}`}
              id="tab-btn-temple"
              type="button"
              role="tab"
              aria-selected={activeTab === "temple"}
              aria-controls="tab-temple"
              tabIndex={activeTab === "temple" ? 0 : -1}
              onKeyDown={handleTabKeyDown}
              onClick={() => setActiveTab("temple")}
            >
              Vedic Sanskar Sabhas
            </button>
          </div>
        </div>

        <div
          role="tabpanel"
          aria-labelledby="tab-btn-kitchen"
          hidden={activeTab !== "kitchen"}
          tabIndex={0}
          id="tab-kitchen"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Giant stainless steel cauldrons in a massive open air kitchen at Triveni Sangam, volunteers in aprons stirring lentils and vegetables over clean wood fire stoves, steam billowing softly, early dawn light."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAcUFsIwdgjHofvXeI7zAsIHylLCAg3ZHdHwML2gdRae_k0kmv6llP6tn548BQS97LqGTmTjKCj_Fm9OEJLJbBCPgW4DuYigOX-M9uXRgDOLkkIG9nkjZ5yfBoAV0VEvZLrRnuSE_CD_yD6IYXyh1tYEIPxwkQk-zked8hPe2vqYa1fic4ECnNwIt8M7W45stJ_r2fJI9nHZ27CM09MmbIPVbzWA7DkbqkFWP--BuyF"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Sangam Ghat Station 3</span>
                <span>Updated 2 hours ago</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Pre-Sunrise Khichdi Preparation
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                3,000 litres of fortified moong dal khichdi prepared under
                strict hygiene guidelines for morning bathers during Paush
                Purnima snan.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Nirashray Foundation sevadars handing out stainless steel thalis with rotis, sabzi, and fresh sweets to elderly pilgrims and saints seated respectfully on straw mats in an open shamiana."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBDwxqUbKvMCH8E96OA4cPG6q9-JFaMqJjJNx-w_hFaj2QJvqBATniY6_ty_R85bWveTferUubtwMbh18QpMHv69X-WIqueqwKgUoSUHNdgDEd2ny5cP6iL7QbB19bUBM3tePsC9q4MKS5j9mfez0ZtWlRsTawHrRNstzoFdNKSapYdPphKAH10fBMAx4q1Fptz4nwbMBikFQAasGy1Q_RZaneR0XRqbINi9ymtuztX"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Daraganj Annakshetra</span>
                <span>Daily Continuous</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Dignified Pangaat Dining
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                No paper waste, no plastic disposable plates. All meals served
                in traditional brass and stainless utensils, cleansed using ash
                and hot water.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Stack of sealed ration packs containing wheat flour, rice, mustard oil, and salt being loaded into a seva van for remote river island sadhus who cannot reach the main camp."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnnxmUJHbZ2-f5hbuW1CS2TbZLbnWbXPpKN3-S40BWItSqUjGlOK8dJZ0UBHSZh1o4cIXjSDDdKQiYxtn7kPtyUCBnujICOj6Q5ZwEMZZauu_dbYvWhVLXHXB920MnXvgG3v5uJeTzkY5z5pwwE8J4wzoJ-8nGw8S7SWM0dBTlWERn_rCslc4WZYInmhDqsfoUxtSOsLIgF0wMT4ddjTNlU3EG_ganvotdzdvFrBP5"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Arail Ghat Boat Dispatch</span>
                <span>Weekly Outreach</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Dry Ration Boat Delivery
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Serving secluded hermits and boatmen families situated across
                remote sandbars along the Yamuna and Ganga confluences.
              </p>
            </div>
          </div>
        </div>
        <div
          role="tabpanel"
          aria-labelledby="tab-btn-classrooms"
          hidden={activeTab !== "classrooms"}
          tabIndex={0}
          id="tab-classrooms"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="A dedicated female instructor pointing at a projector screen explaining HTML and CSS concepts to 20 adolescent girls in Varanasi, rural classroom setting with traditional art on the walls."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDqap-HB21bF1K39JA7hRgiBw_O-cqx0pFI7Ev61S41FNDCnKQ-ZqKo2sqWtGl3NAXjd_Q1UvGrzXlqf4198EkYL_OwJ1j8-RVJUxkuCd2D_PEv7Va6nu7To3qL133bYic4qLgRoIpVr3g1-CPiG8soGbQ0KYF2Q1ylgo4yTlgpnwnf5lseEGxW4V3j80ygy0C4HwjYhG1pbb3EcjHpKUXYJHAZxGP9OG3lmXrY-xfO"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Kashi Kendra 02</span>
                <span>Level 2 Coding Class</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Frontend Web Development
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                High-school daughters mastering modern styling and responsive
                web layouts, creating portfolios to freelance for regional
                shops.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Young rural student demonstrating a smart soil moisture sensor she programmed with Arduino, surrounded by proud classmates and her father wearing a turban."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBh0H101EH0RG1mH0B5ASZa-H7tjYE29HNgEyEg6ffTtzaQhbgnwSTJtuNLhQ_4LDtCwBEAkgEFKVbzTmYk_poBHV8kJlTN-OlrxctVsfPkWaNxBc8eir-2102NZxzrXJ9B_nkz1LpSah9ApYMb2VI_1tMQZfRqR2Ac6rfJJ18B4LbIpDwCZSWmr00H3IlT5YrVWb9MTh89ItPaLrZGGrzY2Ih_CSzQk0YqAuoM7y-P"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Mirzapur Hub</span>
                <span>IoT &amp; Robotics</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                AgriTech &amp; Sensor Automation
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Applying robotics and coding to practical farming challenges
                faced by their own parents in the Vindhyan agricultural belt.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Ceremony where smiling students receive certificates and brand new refurbished laptops in laptop bags, family members clapping proudly in the audience."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCbd-u4MIi3_IvK1RV3K59c8IRrl_YAwmP25w4X3AxWBHOYVicgH2jBRzXZx4N-6TLucYdlPLcKTq7QQlkxqNQAHuRSFVZC1Q_qVmCoLQQeHzwxAofCc5V7k8aw6biybc_oYvmbLSnj1pyMcjeL9ujCGU_5nE0CuIcqUiiCCkNzg9WLqMYzMBz11nA9gfq5njuMlHeNGwbl73wj1dC84HNwUFo6p1q2lp78RmtULgIj"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Prayagraj Headquarters</span>
                <span>Annual Convocation</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Laptop Endowment Ceremony
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Top 200 graduating students are gifted permanent personal
                laptops to support their collegiate degrees and remote
                livelihood tasks.
              </p>
            </div>
          </div>
        </div>
        <div
          role="tabpanel"
          aria-labelledby="tab-btn-rescue"
          hidden={activeTab !== "rescue"}
          tabIndex={0}
          id="tab-rescue"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Veterinary surgeon carefully examining an injured cow with a limb fracture inside a well-lit medical ward at the gaushala, gentle lighting, spotless environment."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDZyA6gEcaIhzOGSB9-oi6HWSjr-X0JXWk0iaI44DOavfIpIqgjjYjJ1eKGO4i78BYSdDZe2mVHTnSr9c5pF-1IT3QoyUvLkZTkc51NMIbaLJ6k68fdwC8edobhidCqL7btPjVDHjCsneVVVArE1KwZFIBxrDglez4WfIq1CB5Iz5NvXyP03Hlk7Cq23LRc-ODlamiD4J8SBAp2O52gZiDEhqUk36IKdTKnZ3FMsWH-"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Emergency Trauma ICU</span>
                <span>Rescue #891</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                National Highway-19 Rescue
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Received via our 24x7 toll-free helpline. Successfully operated
                for tibial trauma; fully rehabilitated and now resting
                comfortably.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="A lush green 10-acre pasture where healthy indigenous cows graze peacefully under banyan trees, clean water troughs filled with crystal fresh borewell water."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuB-vj7_AP57vg1smVu71tRvfKi9IuQ18gmECB27NgdSkXzeTebWqE-ftcRhRjJuaXhcrRKYR9tA0RXqwrBMzOHmvo7J0URHdP1SuR1qVq7NBFTG3YCG4cnntyYQxufPaR2YmUn1BvPBS7ecaxKkNt6oZ24DLLeUOCTSCPtcqiUUk8J9Aey9COGr6QncSXynaMokgOm7GV8JeNAlyz_IHsTeH6N2YGZ2pwDOvanu99yA"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Surabhi Sanctuary Grazing Field</span>
                <span>Daily Pastoral Care</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Open-Paddock Grazing
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                No chaining, no confined stalls. All resident cows enjoy 6 hours
                of natural sunshine and freedom to roam across open meadows
                daily.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Women sevadars making eco-friendly organic dhoop batti incense and seed planters from cow dung and ayurvedic herbs, smiling warmly in a sheltered ashram workshop."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxMK_wmKcyBp3gE9kfuyZAy6MMVuPHp0NCPqrQGoV7F_sSfMBWq0boinSZjmS3CZQVhHGvGqpV1s3Xv7zEkIKSGwqabyZzT9uqIwf_4vDw-uXfvD4fvJhDx5H8rZBykpq13hSLHhfk9-UDHzenLtb1Qm9ZAty2BJ5g6pqXM-Uuhm0MQ5qfwGyzAbSKxPUX3hA9_5SFU7PbN0kDIdXZRiH2X4vx9OzvB2Ot9EogNYAW"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Panchagavya Cottage Unit</span>
                <span>Self-Sustaining Seva</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Gau-Dhoop &amp; Eco Products
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Empowering local rural women through value-added non-dairy
                cattle products: chemical-free mosquito repellents, havana cups,
                and vermicompost.
              </p>
            </div>
          </div>
        </div>
        <div
          role="tabpanel"
          aria-labelledby="tab-btn-temple"
          hidden={activeTab !== "temple"}
          tabIndex={0}
          id="tab-temple"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="Vedic priests and village youth performing a solemn Mahayajna fire ritual with sacred woods, ghee, and mantras in front of a restored stone temple mandapa in a quiet village."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAXKsIKye-tu6jmkI2lYJdy5l7Ko-QBmoObDfxxOBgbb3reOmWoVBKUj43wxgPNNR7qLUBKC7DJHfCvZwSNS4FwLfN8At-T4KKsM6MOMph60PQEUY5-Hgb0HaVktPJsnDVG1w1zTe4qKrEQSZjP4J8tgCd3IXAddfoHYh-feGinuV0t4-_wq6DHAcE2YEQTlQ-R7xHzNB4HcA7P0t1XNMiUX9ASaBGHKUq5B2emY9kt"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Gramin Devalaya Restoration</span>
                <span>Monthly Anushthan</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Restoring Dilapidated Temples
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Rebuilding ancient neglected village shrines into vibrant
                community nodes for evening study circles and Sanskrit hymn
                recitations.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="A circle of children seated on white sheets reciting the Bhagavad Gita slokas guided by an elderly scholar, brass lamps glowing, peaceful devotional ambiance."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuADXF_7dS3NSZzK20SDNog_I5-EVnGT6HDUz_cd3bJgj21P_G52isLnWestPiOcdLu1r6fVmJJeVPMZI26BDLVq_DfQs3qiV9FqX8F2Tvf7IPpFKmb9-It8dkeEscezIEVOHAsh5bVcIrEoqNQ8Y_Ol3p4I__OQSGJz0qz85r9QFHgOGbcqqXPzwB6Hv0QUrNaDwggbaQYMMnpSD9OQ8JNh5eHfmlTgZ3lgRchbWO5X"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Vedic Sanskar Sabhas</span>
                <span>Weekend Batches</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Bal Sanskar &amp; Gita Path
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Inculcating moral courage, respect for elders, and mental
                clarity through recitation of timeless Sanskrit texts and
                character-building stories.
              </p>
            </div>
            <div className="bg-[#ffffff] rounded-[8px] p-5 shadow-sm space-y-3">
              <Image
                className="w-full h-48 object-cover rounded-[4px]"
                alt="A tranquil evening Ganga Aarti ceremony arranged by Nirashray volunteers with towering multi-tiered brass oil lamps sending golden reflections across the holy river water."
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBVuoZVOao9mWcwwc1Z3BIXs55KxNcJfGanApznOw-eB_0Suvv-J3oTkuAroiXozoT7dPhr17mx9rLEi6IFeOoMG3WoL6mKf10nMaIZP0Zi4BiPgkqRj1MPVIGZBpEoSyodh0rNSX-jwb_MqTjosPOQ10zhtZJCuIgQyejz0lwlKe6TWlJhgfshd2oF4ydEjN-zxDsPutGRIpdtpI6Y8zeLhLlhjLCyWq6mzStd3s1V"
                width={800}
                height={600}
                unoptimized
              />
              <div className="flex flex-wrap gap-2 items-center justify-between text-[12px] text-[#717974]">
                <span>Triveni Ghat, Prayagraj</span>
                <span>Daily Sandhya Seva</span>
              </div>
              <h4 className="font-[family-name:var(--font-home-heading)] text-[22px] leading-[30px] font-semibold text-[#023727]">
                Triveni Deep Daan &amp; Aarti
              </h4>
              <p className="text-sm leading-5 text-[#414944] leading-relaxed">
                Facilitating dignified, noise-free, pure traditional river
                worship honoring Mother Ganga, free of commercial exploitation
                for pilgrims.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
