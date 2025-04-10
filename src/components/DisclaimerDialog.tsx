
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface DisclaimerDialogProps {
  onAccept: () => void;
}

const DisclaimerDialog = ({ onAccept }: DisclaimerDialogProps) => {
  const [open, setOpen] = useState(true);

  // No longer checking localStorage - disclaimer will show on every refresh

  const handleAccept = () => {
    // No longer saving to localStorage
    setOpen(false);
    onAccept();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className="mx-auto bg-amber-100 rounded-full p-2">
            <AlertCircle className="h-6 w-6 text-amber-600" />
          </div>
          <DialogTitle className="text-center text-xl">Disclaimer</DialogTitle>
          <DialogDescription className="text-center">
            Before you proceed, please read and accept the following disclaimer
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4 text-sm">
          <p>
            This AI assistant is designed to help you interact with documents but may occasionally provide inaccurate information.
          </p>
          <p>
            The information provided through this tool is for general informational purposes only and should not be relied upon for critical decisions.
          </p>
          <p>
            By clicking "I Accept" below, you acknowledge that:
          </p>
          <ul className="list-disc pl-5 space-y-2">
            <li>You understand the limitations of AI technology</li>
            <li>You will verify important information from official sources</li>
            <li>You assume responsibility for decisions made based on information provided by this tool</li>
          </ul>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row sm:justify-center pt-2">
          <Button onClick={handleAccept} className="w-full sm:w-auto">
            I Accept
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DisclaimerDialog;
