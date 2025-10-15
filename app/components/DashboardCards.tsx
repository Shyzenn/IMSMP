import React from "react";
import { DashboardCardProps } from "@/lib/interfaces";
import Link from "next/link";
import { motion, useSpring, useTransform } from "framer-motion";

export function AnimatedNumber({ value }: { value: number }) {
  const spring = useSpring(0, { stiffness: 100, damping: 20 });
  const display = useTransform(spring, (latest) => Math.floor(latest));

  React.useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

const DashboardCards = ({ cards }: { cards: DashboardCardProps[] }) => {
  return (
    <div className="flex gap-5 h-full">
      {cards.map((card, index) => {
        const Icon = card.icon;

        const CardContent = (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-3 flex-col">
                <p className="text-gray-500 uppercase text-sm font-semibold">
                  {card.title}
                </p>

                <p className="text-2xl font-semibold text-gray-700">
                  {typeof card.value === "number" ? (
                    <AnimatedNumber value={card.value} />
                  ) : (
                    card.value
                  )}
                </p>
              </div>
              <div
                className={`${card.bgColor} ${card.textColor} p-4 rounded-md mr-2`}
              >
                <Icon className="text-2xl" />
              </div>
            </div>
          </>
        );

        const baseCardClasses =
          "relative shadow-md flex-1 flex flex-col justify-center px-4 rounded-md transition-all duration-300 ease-in-out hover:-translate-y-1 hover:shadow-lg overflow-hidden bg-white";

        return card.link ? (
          <Link href={card.link} key={index} className={baseCardClasses}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 120"
              className="absolute top-0 left-0 w-[200px] h-[130px]"
            >
              <path
                d="m189.5-25.8c0 0 20.1 46.2-26.7 71.4 0 0-60 15.4-62.3 65.3-2.2 49.8-50.6 59.3-57.8 61.5-7.2 2.3-60.8 0-60.8 0l-11.9-199.4z"
                fill="#0ff787"
                opacity="0.05"
              />
            </svg>
            {CardContent}
          </Link>
        ) : (
          <div key={index} className={baseCardClasses}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 200 120"
              className="absolute top-0 left-0 w-[200px] h-[130px]"
            >
              <path
                d="m189.5-25.8c0 0 20.1 46.2-26.7 71.4 0 0-60 15.4-62.3 65.3-2.2 49.8-50.6 59.3-57.8 61.5-7.2 2.3-60.8 0-60.8 0l-11.9-199.4z"
                fill="#0ff787"
                opacity="0.05"
              />
            </svg>
            {CardContent}
          </div>
        );
      })}
    </div>
  );
};

export default DashboardCards;
