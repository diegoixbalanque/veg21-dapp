import { Dialog, DialogContent } from "@/components/ui/dialog";
import { CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MessageModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'success' | 'error';
  title: string;
  message: string;
}

export function MessageModal({ isOpen, onClose, type, title, message }: MessageModalProps) {
  const Icon = type === 'success' ? CheckCircle : XCircle;
  const iconColor = type === 'success' ? 'text-green-600' : 'text-red-600';
  const bgColor = type === 'success' ? 'bg-green-100' : 'bg-red-100';

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <div className="text-center">
          <div className={`w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center ${bgColor}`}>
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <h3 className="text-xl font-bold text-veg-dark mb-2">{title}</h3>
          <p className="text-gray-600 mb-6">{message}</p>
          <Button 
            onClick={onClose}
            className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
          >
            Entendido
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
