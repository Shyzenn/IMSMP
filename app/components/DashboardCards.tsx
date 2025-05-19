import { DashboardCardProps } from "@/lib/interfaces";
import React from "react";

const DashboardCards = ({ cards }: { cards: DashboardCardProps[] }) => {
  return (
    <div className="flex gap-5 h-full">
      {cards.map((card, index) => (
        <div
          key={index}
          className="shadow-sm bg-white flex-1 py-2 px-3 flex flex-col justify-between rounded-md"
        >
          <div className="flex items-center justify-between">
            <p className="text-xl">{card.title}</p>
          </div>
          <div className="flex items-center justify-between">
            <p className="text-2xl">{card.value}</p>
            <div className={`${card.bgColor} ${card.textColor} p-2 rounded-md`}>
              <card.icon className="text-xl" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default DashboardCards;
