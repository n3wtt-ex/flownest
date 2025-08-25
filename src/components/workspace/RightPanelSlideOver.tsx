import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export function RightPanelSlideOver() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className="rounded-full">Agents</Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[360px] sm:w-[420px]">
        <SheetHeader>
          <SheetTitle>Agent Activity</SheetTitle>
        </SheetHeader>
        <div className="mt-4 space-y-3 text-sm text-muted-foreground">
          <div>• Eva assigned tasks to Leo</div>
          <div>• Sophie drafted copy for Step 1</div>
          <div>• Clara flagged 3 positive replies</div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
