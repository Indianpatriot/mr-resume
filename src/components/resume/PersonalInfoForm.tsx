
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface PersonalInfoData {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
}

interface PersonalInfoFormProps {
  data: PersonalInfoData;
  updateData: (data: PersonalInfoData) => void;
}

const PersonalInfoForm = ({ data, updateData }: PersonalInfoFormProps) => {
  const { register, handleSubmit, setValue, watch } = useForm<PersonalInfoData>({
    defaultValues: data,
  });

  // Watch for form changes to update preview in real-time
  const formValues = watch();
  
  useEffect(() => {
    updateData(formValues);
  }, [formValues, updateData]);

  // Set initial values
  useEffect(() => {
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        setValue(key as keyof PersonalInfoData, value);
      });
    }
  }, [data, setValue]);

  return (
    <form className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-lg font-bold">Full Name</Label>
        <Input
          id="fullName"
          {...register("fullName")}
          placeholder="John Doe"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email" className="text-lg font-bold">Email</Label>
        <Input
          id="email"
          type="email"
          {...register("email")}
          placeholder="john.doe@example.com"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="phone" className="text-lg font-bold">Phone Number</Label>
        <Input
          id="phone"
          {...register("phone")}
          placeholder="(123) 456-7890"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="location" className="text-lg font-bold">Location</Label>
        <Input
          id="location"
          {...register("location")}
          placeholder="New York, NY"
          className="border-4 border-black p-6 text-lg"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="summary" className="text-lg font-bold">Professional Summary</Label>
        <Textarea
          id="summary"
          {...register("summary")}
          placeholder="Briefly describe your professional background and career goals..."
          className="border-4 border-black p-6 text-lg min-h-[150px]"
        />
      </div>

      <Button 
        type="button" 
        className="w-full bg-blue-500 text-white border-4 border-black transform hover:rotate-1 transition-transform"
        onClick={() => {
          // This would connect to an AI endpoint to generate a professional summary
          setValue("summary", "Experienced software engineer with 5+ years of expertise in developing scalable web applications. Proficient in React, TypeScript, and Node.js with a strong focus on creating responsive and user-friendly interfaces.");
          updateData({
            ...formValues,
            summary: "Experienced software engineer with 5+ years of expertise in developing scalable web applications. Proficient in React, TypeScript, and Node.js with a strong focus on creating responsive and user-friendly interfaces.",
          });
        }}
      >
        Generate AI Summary
      </Button>
    </form>
  );
};

export default PersonalInfoForm;
