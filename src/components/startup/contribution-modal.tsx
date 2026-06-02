"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Textarea,
  Input,
  Checkbox,
  CheckboxGroup,
  cn,
} from "@nextui-org/react";
import { Code, DollarSign, CheckCircle2, ArrowRight, ArrowLeft, Send } from "lucide-react";

// Zod validation schema for Contribution Ticket
const ContributionFormSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  pitchDescription: z.string().min(20, "Pitch description must be at least 20 characters"),
  type: z.enum(["SKILLS", "FUNDING"]),
  skillsOffered: z.array(z.string()).min(1, "Please select at least one skill").optional(),
  financialFundingAmount: z
    .string()
    .optional()
    .refine(
      (val) => !val || !isNaN(Number(val)) && Number(val) > 0,
      { message: "Funding amount must be a positive number" }
    ),
});

type ContributionFormValues = z.infer<typeof ContributionFormSchema>;

interface ContributionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  startupName: string;
  startupId: string;
  onSubmitAction: (data: any) => Promise<void>;
}

const AVAILABLE_SKILLS = [
  "Frontend Development",
  "Backend Development",
  "UI/UX Design",
  "Growth Marketing",
  "Product Management",
  "DevOps / Infrastructure",
  "Sales & Business Development",
  "Legal & Finance Advisory",
];

export function ContributionModal({
  isOpen,
  onOpenChange,
  startupName,
  startupId,
  onSubmitAction,
}: ContributionModalProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    trigger,
    formState: { errors },
    reset,
  } = useForm<ContributionFormValues>({
    resolver: zodResolver(ContributionFormSchema),
    defaultValues: {
      title: "",
      pitchDescription: "",
      type: "SKILLS",
      skillsOffered: [],
      financialFundingAmount: "",
    },
  });

  const contributionType = watch("type");
  const selectedSkills = watch("skillsOffered") || [];

  const handleTypeSelect = (type: "SKILLS" | "FUNDING") => {
    setValue("type", type);
    if (type === "SKILLS") {
      setValue("financialFundingAmount", "");
    } else {
      setValue("skillsOffered", []);
    }
    setStep(2);
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleNextStep = async () => {
    if (step === 1) {
      setStep(2);
    }
  };

  const processFormSubmit = async (values: ContributionFormValues) => {
    setIsSubmitting(true);
    try {
      const payload = {
        startupId,
        title: values.title,
        pitchDescription: values.pitchDescription,
        skillsOffered: values.type === "SKILLS" ? values.skillsOffered : [],
        financialFundingAmount:
          values.type === "FUNDING" && values.financialFundingAmount
            ? parseFloat(values.financialFundingAmount)
            : null,
        status: "PENDING",
      };
      
      await onSubmitAction(payload);
      setStep(3); // Success step
    } catch (error) {
      console.error("Submission failed", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = (onClose: () => void) => {
    onClose();
    // Reset state after transition finishes
    setTimeout(() => {
      reset();
      setStep(1);
    }, 300);
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="lg"
      backdrop="blur"
      className="border border-divider bg-background/80 backdrop-blur-lg shadow-2xl rounded-3xl"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 pb-2">
              <span className="text-xs uppercase tracking-widest text-primary font-bold">
                Contribution Engine
              </span>
              <h2 className="text-xl font-bold tracking-tight">
                Pitch to {startupName}
              </h2>
            </ModalHeader>
            <ModalBody className="py-4">
              <AnimatePresence mode="wait">
                {step === 1 && (
                  <motion.div
                    key="step-1"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <p className="text-sm text-default-500 mb-2">
                      Choose how you want to contribute. You can pitch your talents as a skilled contributor or offer direct financial funding.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        type="button"
                        onClick={() => handleTypeSelect("SKILLS")}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-all bg-content1/50 hover:bg-content1",
                          contributionType === "SKILLS"
                            ? "border-primary ring-1 ring-primary"
                            : "border-divider hover:border-foreground/20"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                          <Code className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm">Skills & Resources</h3>
                          <p className="text-xs text-default-400">
                            Offer development, design, marketing, or other operations.
                          </p>
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => handleTypeSelect("FUNDING")}
                        className={cn(
                          "flex flex-col items-center gap-3 p-6 rounded-2xl border text-center transition-all bg-content1/50 hover:bg-content1",
                          contributionType === "FUNDING"
                            ? "border-primary ring-1 ring-primary"
                            : "border-divider hover:border-foreground/20"
                        )}
                      >
                        <div className="w-12 h-12 rounded-full bg-secondary/10 flex items-center justify-center text-secondary">
                          <DollarSign className="w-6 h-6" />
                        </div>
                        <div className="space-y-1">
                          <h3 className="font-bold text-sm">Financial Funding</h3>
                          <p className="text-xs text-default-400">
                            Back this startup directly with milestone-based investment capital.
                          </p>
                        </div>
                      </button>
                    </div>
                  </motion.div>
                )}

                {step === 2 && (
                  <motion.div
                    key="step-2"
                    initial={{ opacity: 0, x: 10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-4"
                  >
                    <Input
                      {...register("title")}
                      label="Contribution Title"
                      placeholder="e.g., Fractional Backend Lead / Seed Stage Angel Round"
                      variant="bordered"
                      labelPlacement="outside"
                      isInvalid={!!errors.title}
                      errorMessage={errors.title?.message}
                      classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                    />

                    <Textarea
                      {...register("pitchDescription")}
                      label="Pitch Details"
                      placeholder="Explain your value proposition, background, and alignment with the startup's current trajectory..."
                      variant="bordered"
                      minRows={3}
                      maxRows={6}
                      labelPlacement="outside"
                      isInvalid={!!errors.pitchDescription}
                      errorMessage={errors.pitchDescription?.message}
                      classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                    />

                    {contributionType === "SKILLS" ? (
                      <div className="space-y-2">
                        <label className="text-sm font-medium text-foreground">
                          Skills Offered (Select all that apply)
                        </label>
                        <CheckboxGroup
                          value={selectedSkills}
                          onValueChange={(val) => setValue("skillsOffered", val)}
                          color="primary"
                          className="gap-2"
                        >
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                            {AVAILABLE_SKILLS.map((skill) => (
                              <Checkbox
                                key={skill}
                                value={skill}
                                classNames={{
                                  base: cn(
                                    "inline-flex max-w-full bg-content1/50 hover:bg-content1 items-center justify-start",
                                    "cursor-pointer rounded-xl gap-2 p-2 border border-divider",
                                    "data-[selected=true]:border-primary"
                                  ),
                                  label: "text-xs font-semibold",
                                }}
                              >
                                {skill}
                              </Checkbox>
                            ))}
                          </div>
                        </CheckboxGroup>
                        {errors.skillsOffered && (
                          <span className="text-xs text-danger font-medium block mt-1">
                            {errors.skillsOffered.message}
                          </span>
                        )}
                      </div>
                    ) : (
                      <Input
                        {...register("financialFundingAmount")}
                        type="text"
                        label="Funding Commitment"
                        placeholder="e.g., 50000"
                        variant="bordered"
                        labelPlacement="outside"
                        startContent={<DollarSign className="text-default-400 w-4 h-4 flex-shrink-0" />}
                        endContent={<span className="text-xs font-semibold text-default-400">USD</span>}
                        isInvalid={!!errors.financialFundingAmount}
                        errorMessage={errors.financialFundingAmount?.message}
                        classNames={{ inputWrapper: "border-divider hover:border-foreground/30 focus-within:!border-primary" }}
                      />
                    )}
                  </motion.div>
                )}

                {step === 3 && (
                  <motion.div
                    key="step-3"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.3 }}
                    className="flex flex-col items-center justify-center py-6 text-center space-y-4"
                  >
                    <motion.div
                      initial={{ rotate: -45, scale: 0.5 }}
                      animate={{ rotate: 0, scale: 1 }}
                      transition={{ type: "spring", stiffness: 200, delay: 0.1 }}
                      className="w-16 h-16 rounded-full bg-success/10 text-success flex items-center justify-center"
                    >
                      <CheckCircle2 className="w-10 h-10" />
                    </motion.div>
                    <div className="space-y-1">
                      <h3 className="font-bold text-lg">Pitch Submitted Successfully!</h3>
                      <p className="text-sm text-default-500 max-w-sm">
                        Your contribution ticket has been registered in the startup's ledger. The founder will review it and follow up via email.
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </ModalBody>
            <ModalFooter className="border-t border-divider mt-4">
              {step === 2 && (
                <Button
                  variant="light"
                  onClick={handleBack}
                  startContent={<ArrowLeft className="w-4 h-4" />}
                  className="font-semibold text-default-500"
                >
                  Back
                </Button>
              )}
              {step !== 3 ? (
                <Button
                  color="primary"
                  onClick={
                    step === 1 ? handleNextStep : handleSubmit(processFormSubmit)
                  }
                  isLoading={isSubmitting}
                  endContent={
                    step === 1 ? (
                      <ArrowRight className="w-4 h-4" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )
                  }
                  className="font-semibold px-6 shadow-md shadow-primary/20"
                >
                  {step === 1 ? "Next Details" : "Submit Ticket"}
                </Button>
              ) : (
                <Button
                  color="success"
                  variant="flat"
                  onClick={() => handleClose(onClose)}
                  className="font-semibold w-full"
                >
                  Done
                </Button>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
