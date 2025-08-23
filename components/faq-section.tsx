import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How much does Kindwell cost?",
    answer:
      "Our pricing varies by service and consultation type. Most consultations are eligible for Medicare rebates, significantly reducing your out-of-pocket costs. Initial consultations start from $4.10 after Medicare rebates.",
  },
  {
    question: "When is payment for the consultation taken?",
    answer:
      "Payment is taken at the time of booking your consultation. We accept all major payment methods and will process your Medicare claim automatically where applicable.",
  },
  {
    question: "What are the ongoing costs for treatment?",
    answer:
      "Ongoing costs depend on your individual treatment plan. Review consultations for existing patients start from $15.10 after Medicare rebates. We'll discuss all costs transparently during your consultation.",
  },
  {
    question: "Who is Kindwell for?",
    answer:
      "Kindwell is for anyone seeking alternative healthcare solutions, including medicinal cannabis treatment and smoking cessation support. Our qualified practitioners assess each patient individually to ensure appropriate care.",
  },
  {
    question:
      "What natural medicines are available through Kindwell and are they legal?",
    answer:
      "We offer a range of legal, evidence-based natural medicines including medicinal cannabis (where appropriate and legal), plant-based therapies, and smoking cessation treatments. All treatments are prescribed by qualified healthcare professionals in accordance with Australian regulations.",
  },
];

export function FAQSection() {
  return (
    <section id="faq" className="py-20 bg-[#EDF1FF] text-primary">
      <div className="container flex flex-col md:flex-row justify-center items-center mx-auto gap-16 px-4">
        <div className="text-center flex justify-center items-center w-xl">
          <h2 className="text-6xl md:text-4xl font-semibold mb-4">FAQ's</h2>
        </div>

        <Accordion type="single" collapsible className="space-y-4 max-w-xl">
          {faqs.map((faq, index) => (
            <AccordionItem
              key={index}
              value={`item-${index}`}
              className="bg-transparent border-b border-primary px-6 stroke-primary"
            >
              <AccordionTrigger className="text-left font-semibold cursor-pointer">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
