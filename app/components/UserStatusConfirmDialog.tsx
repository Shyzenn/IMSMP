import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { ReactNode } from "react";
import { IconType } from "react-icons/lib";

type ConfirmDialogProps = {
  iconColor: string;
  icon: IconType;
  buttonLabel: string;
  title: string;
  description: string;
  buttonWidth?: string;
  confirmButton: () => void;
  iconOnly?: boolean;
  modalButtonLabel: ReactNode;
  bgRedButton?: boolean;
};

const UserStatusConfirmDialog = ({
  buttonWidth,
  iconColor,
  icon: Icon,
  buttonLabel,
  title,
  description,
  confirmButton,
  iconOnly,
  modalButtonLabel,
  bgRedButton,
}: ConfirmDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        {iconOnly ? (
          <Icon className={`${iconColor} cursor-pointer`} />
        ) : (
          <Button variant="outline" className={buttonWidth}>
            {buttonLabel}
            <Icon className={iconColor} />
          </Button>
        )}
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={confirmButton}
            className={`${
              bgRedButton
                ? "bg-red-500 hover:bg-red-400"
                : "bg-buttonBgColor hover:bg-buttonHover"
            }`}
          >
            {modalButtonLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserStatusConfirmDialog;
