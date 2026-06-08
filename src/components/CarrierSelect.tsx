import { Select, SelectProps } from "@mantine/core";

const carriers = [
  { value: "A. Duie Pyle", label: "A. Duie Pyle" },
  { value: "AAA Cooper", label: "AAA Cooper" },
  { value: "ABF Freight", label: "ABF Freight" },
  { value: "ACE Transport", label: "ACE Transport" },
  { value: "ACI motor Freight", label: "ACI motor Freight" },
  { value: "Best Overnite", label: "Best Overnite" },
  { value: "Central Transport", label: "Central Transport" },
  { value: "Custom Co.", label: "Custom Co." },
  { value: "Daylight", label: "Daylight" },
  { value: "Dayton Freight", label: "Dayton Freight" },
  { value: "DDDP", label: "DDDP" },
  { value: "Dohrn Transfer", label: "Dohrn Transfer" },
  { value: "Dugan Truck Lines", label: "Dugan Truck Lines" },
  { value: "EDI Express", label: "EDI Express" },
  { value: "Estes", label: "Estes" },
  { value: "Fedex Economy", label: "Fedex Economy" },
  { value: "Fedex Priority", label: "Fedex Priority" },
  { value: "Fedex Freight", label: "Fedex Freight" },
  { value: "Fedex Ground", label: "Fedex Ground" },
  { value: "Glovalink", label: "Glovalink" },
  { value: "Roadrunner", label: "Roadrunner" },
  { value: "R&L Carriers", label: "R&L Carriers" },
  { value: "TOTAL Transport", label: "TOTAL Transport" },
  { value: "Local Regional Carrier", label: "Local Regional Carrier" },
  { value: "XPO Logistics", label: "XPO Logistics" },
  { value: "T-Force", label: "T-Force" },
  { value: "Ward Trucking", label: "Ward Trucking" },
  { value: "Southeastern Freight Lines", label: "Southeastern Freight Lines" },
  { value: "Saia", label: "Saia" },
  { value: "Old Dominion", label: "Old Dominion" },
  { value: "Forward Air", label: "Forward Air" },
  { value: "Pitt Ohio", label: "Pitt Ohio" },
  { value: "Full Truckload", label: "Full Truckload" },
  { value: "Partial Truckload", label: "Partial Truckload" },
  { value: "Other", label: "Other" },
];

interface CarrierSelectProps extends Omit<SelectProps, "data"> {
  data?: never;
}

const CarrierSelect = ({ ...props }: CarrierSelectProps) => {
  return <Select data={carriers} {...props} />;
};

export default CarrierSelect;
