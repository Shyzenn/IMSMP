import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import React, { ReactNode } from "react";

const ToolTip = ({
  isButton,
  label,
  tooltip,
  icon,
  onClick,
  buttonClassName,
}: {
  isButton: boolean;
  label?: string | ReactNode;
  tooltip: string;
  icon?: ReactNode;
  onClick?: () => void;
  buttonClassName?: string;
}) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          {isButton ? (
            <button className={buttonClassName} onClick={onClick} type="button">
              {label}
            </button>
          ) : (
            <div className="text-gray-500">{icon}</div>
          )}
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ToolTip;
