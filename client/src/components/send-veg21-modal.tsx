import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowUpRight, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { mockWeb3Service, formatTokenAmount } from "@/lib/mockWeb3";
import { useToast } from "@/hooks/use-toast";

interface SendVEG21ModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentBalance: number;
}

export function SendVEG21Modal({ isOpen, onClose, currentBalance }: SendVEG21ModalProps) {
  const [toAddress, setToAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleClose = () => {
    if (!isSending) {
      setToAddress('');
      setAmount('');
      setDescription('');
      setError('');
      setSuccess(false);
      onClose();
    }
  };

  const validateForm = (): boolean => {
    setError('');

    if (!toAddress.trim()) {
      setError('La dirección de destino es obligatoria');
      return false;
    }

    if (toAddress.length < 10) {
      setError('La dirección de destino no es válida (mínimo 10 caracteres)');
      return false;
    }

    const amountNum = parseFloat(amount);
    if (!amount || isNaN(amountNum) || amountNum <= 0) {
      setError('El monto debe ser mayor a 0');
      return false;
    }

    if (amountNum > currentBalance) {
      setError(`Saldo insuficiente. Disponible: ${formatTokenAmount(currentBalance)} VEG21`);
      return false;
    }

    return true;
  };

  const handleSend = async () => {
    if (!validateForm()) return;

    setIsSending(true);
    setError('');

    try {
      const amountNum = parseFloat(amount);
      const tx = await mockWeb3Service.transferTokens(
        toAddress.trim(),
        amountNum,
        description.trim() || undefined
      );

      setSuccess(true);
      
      toast({
        title: "¡Transferencia exitosa!",
        description: `Enviaste ${formatTokenAmount(amountNum)} VEG21 a ${toAddress.slice(0, 8)}...${toAddress.slice(-6)}`,
        variant: "default",
      });

      // Close modal after short delay
      setTimeout(() => {
        handleClose();
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error al enviar tokens';
      setError(errorMessage);
      
      toast({
        title: "Error al enviar tokens",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSending(false);
    }
  };

  const handleSetMaxAmount = () => {
    setAmount(currentBalance.toString());
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md" data-testid="modal-send-veg21">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <ArrowUpRight className="w-5 h-5 text-veg-primary" />
            <span>Enviar VEG21 Tokens</span>
          </DialogTitle>
          <DialogDescription>
            Transfiere tokens VEG21 a otra dirección de wallet
          </DialogDescription>
        </DialogHeader>

        {success ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ¡Transferencia Exitosa!
            </h3>
            <p className="text-gray-600">
              Tus tokens han sido enviados correctamente
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-900">
                <span className="font-semibold">Saldo disponible:</span>{' '}
                <span className="font-bold" data-testid="text-available-balance">
                  {formatTokenAmount(currentBalance)} VEG21
                </span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="toAddress">
                Dirección de Destino <span className="text-red-500">*</span>
              </Label>
              <Input
                id="toAddress"
                data-testid="input-to-address"
                placeholder="0x1234567890abcdef..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                disabled={isSending}
                className="font-mono text-sm"
              />
              <p className="text-xs text-gray-500">
                Ingresa la dirección de wallet del destinatario
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">
                Cantidad <span className="text-red-500">*</span>
              </Label>
              <div className="flex space-x-2">
                <Input
                  id="amount"
                  data-testid="input-amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={isSending}
                  className="flex-1"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleSetMaxAmount}
                  disabled={isSending}
                  data-testid="button-max-amount"
                >
                  Máx
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Ingresa la cantidad de VEG21 tokens a enviar
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                Descripción (opcional)
              </Label>
              <Textarea
                id="description"
                data-testid="textarea-description"
                placeholder="Ej: Gracias por tu apoyo a la comunidad vegana..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                disabled={isSending}
                maxLength={200}
                className="min-h-[80px]"
              />
              <p className="text-xs text-gray-500">
                {description.length}/200 caracteres
              </p>
            </div>

            {error && (
              <div className="bg-red-50 p-3 rounded-lg border border-red-200 flex items-start space-x-2" data-testid="alert-error">
                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-900">{error}</p>
              </div>
            )}

            <div className="flex justify-end space-x-3 pt-4">
              <Button
                variant="outline"
                onClick={handleClose}
                disabled={isSending}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleSend}
                disabled={isSending}
                className="bg-gradient-to-r from-veg-primary to-veg-secondary text-white hover:from-veg-secondary hover:to-veg-primary"
                data-testid="button-send"
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Enviando...
                  </>
                ) : (
                  <>
                    <ArrowUpRight className="w-4 h-4 mr-2" />
                    Enviar Tokens
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
