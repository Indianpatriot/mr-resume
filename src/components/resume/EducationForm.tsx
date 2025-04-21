
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, X } from "lucide-react";

interface EducationItem {
  id: string;
  institution: string;
  degree: string;
  field: string;
  startDate: string;
  endDate: string;
  isCurrent?: boolean;
}

interface EducationFormProps {
  data: EducationItem[];
  updateData: (data: EducationItem[]) => void;
}

const EducationForm = ({ data, updateData }: EducationFormProps) => {
  const [educationItems, setEducationItems] = useState<EducationItem[]>(data || []);
  const [editIndex, setEditIndex] = useState<number>(-1);
  
  const { register, handleSubmit, reset, setValue, watch } = useForm<EducationItem>({
    defaultValues: {
      id: "",
      institution: "",
      degree: "",
      field: "",
      startDate: "",
      endDate: "",
      isCurrent: false,
    }
  });

  useEffect(() => {
    updateData(educationItems);
  }, [educationItems, updateData]);

  const addEducation = (formData: EducationItem) => {
    if (editIndex >= 0) {
      const updatedEducation = [...educationItems];
      updatedEducation[editIndex] = { ...formData, id: educationItems[editIndex].id };
      setEducationItems(updatedEducation);
      setEditIndex(-1);
    } else {
      setEducationItems([
        ...educationItems,
        { ...formData, id: `edu-${Date.now()}` }
      ]);
    }
    reset();
  };

  const editEducation = (index: number) => {
    const edu = educationItems[index];
    Object.entries(edu).forEach(([key, value]) => {
      setValue(key as keyof EducationItem, value);
    });
    setEditIndex(index);
  };

  const removeEducation = (index: number) => {
    setEducationItems(educationItems.filter((_, i) => i !== index));
    if (editIndex === index) {
      reset();
      setEditIndex(-1);
    }
  };

  const isCurrent = watch("isCurrent");

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit(addEducation)} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="institution" className="text-lg font-bold">Institution</Label>
          <Input
            id="institution"
            {...register("institution")}
            placeholder="University or School Name"
            className="border-4 border-black p-6 text-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="degree" className="text-lg font-bold">Degree</Label>
          <Input
            id="degree"
            {...register("degree")}
            placeholder="e.g. Bachelor of Science"
            className="border-4 border-black p-6 text-lg"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="field" className="text-lg font-bold">Field of Study</Label>
          <Input
            id="field"
            {...register("field")}
            placeholder="e.g. Computer Science"
            className="border-4 border-black p-6 text-lg"
            required
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="startDate" className="text-lg font-bold">Start Date</Label>
            <Input
              id="startDate"
              type="date"
              {...register("startDate")}
              className="border-4 border-black p-6 text-lg"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="endDate" className="text-lg font-bold">End Date</Label>
            <Input
              id="endDate"
              type="date"
              {...register("endDate")}
              className="border-4 border-black p-6 text-lg"
              disabled={isCurrent}
              required={!isCurrent}
            />
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center">
            <input
              id="isCurrent"
              type="checkbox"
              {...register("isCurrent")}
              className="w-5 h-5 border-2 border-black"
            />
            <Label htmlFor="isCurrent" className="ml-2 text-lg">
              I'm currently studying here
            </Label>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            type="submit"
            className="bg-pink-500 hover:bg-pink-600 text-white border-4 border-black transform hover:-rotate-1 transition-transform"
          >
            {editIndex >= 0 ? "Update Education" : "Add Education"}
          </Button>
        </div>
      </form>

      {educationItems.length > 0 && (
        <div className="space-y-4 pt-4 border-t-4 border-black">
          <h3 className="text-xl font-bold">Education</h3>
          {educationItems.map((edu, index) => (
            <Card key={edu.id} className="border-4 border-black relative">
              <CardHeader className="pb-2">
                <CardTitle>{edu.degree} in {edu.field}</CardTitle>
                <Button
                  variant="outline"
                  size="icon"
                  className="absolute top-2 right-2 border-2 border-black"
                  onClick={() => removeEducation(index)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </CardHeader>
              <CardContent className="pb-0">
                <p className="font-medium">{edu.institution}</p>
                <p className="text-gray-600">
                  {edu.startDate} - {edu.isCurrent ? "Present" : edu.endDate}
                </p>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  variant="outline" 
                  className="border-2 border-black"
                  onClick={() => editEducation(index)}
                >
                  Edit
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {educationItems.length === 0 && (
        <div className="border-4 border-black p-6 text-center bg-gray-50">
          <p className="text-lg text-gray-500">No education added yet.</p>
          <Button 
            variant="outline" 
            className="mt-2 flex items-center gap-2 border-2 border-black mx-auto"
          >
            <Plus className="h-4 w-4" /> Add Your Education
          </Button>
        </div>
      )}
    </div>
  );
};

export default EducationForm;
