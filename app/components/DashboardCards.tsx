import React from "react";
import { DashboardCardProps } from "@/lib/interfaces";
import Link from "next/link";

const DashboardCards = ({ cards }: { cards: DashboardCardProps[] }) => {
  return (
    <div className="flex gap-5 h-full">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <Link
            href={card.link}
            key={index}
            className="shadow-md bg-white flex-1 py-2 px-3 flex flex-col justify-between rounded-md"
          >
            <div className="flex items-center justify-between">
              <p className="text-xl">{card.title}</p>
            </div>
            <div className="flex items-center justify-between">
              <p className="text-2xl">{card.value}</p>
              <div
                className={`${card.bgColor} ${card.textColor} p-2 rounded-md`}
              >
                <Icon className="text-xl" />
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default DashboardCards;
