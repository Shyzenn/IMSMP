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
import { IconType } from "react-icons/lib";

type ConfirmDialogProps = {
  iconColor: string;
  icon: IconType;
  buttonLabel: string;
  title: string;
  description: string;
  buttonWidth?: string;
  confirmButton: () => void;
};

const UserStatusConfirmDialog = ({
  buttonWidth,
  iconColor,
  icon: Icon,
  buttonLabel,
  title,
  description,
  confirmButton,
}: ConfirmDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" className={buttonWidth}>
          {buttonLabel}
          <Icon className={iconColor} />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={confirmButton}>
            Continue
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default UserStatusConfirmDialog;
