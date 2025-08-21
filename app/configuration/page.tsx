import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Users, Shield, Cog, Database, Truck, Cpu } from "lucide-react"

const configurationOptions = [
  {
    title: "Users",
    description: "Manage user accounts, permissions, and access levels",
    href: "/configuration/users",
    icon: Users,
    color: "bg-blue-500",
  },
  {
    title: "Roles",
    description: "Configure user roles and permission sets",
    href: "/configuration/roles",
    icon: Shield,
    color: "bg-green-500",
  },
  {
    title: "Machines",
    description: "Manage manufacturing equipment and machinery",
    href: "/configuration/machines",
    icon: Cog,
    color: "bg-orange-500",
  },
  {
    title: "Silos",
    description: "Configure storage silos and capacity management",
    href: "/configuration/silos",
    icon: Database,
    color: "bg-purple-500",
  },
  {
    title: "Suppliers",
    description: "Manage supplier information and relationships",
    href: "/configuration/suppliers",
    icon: Truck,
    color: "bg-red-500",
  },
  {
    title: "Devices",
    description: "Configure IoT devices and sensors",
    href: "/configuration/devices",
    icon: Cpu,
    color: "bg-indigo-500",
  },
]

export default function ConfigurationPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuration</h1>
        <p className="text-muted-foreground">Manage system settings, users, and equipment configuration</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {configurationOptions.map((option) => (
          <Card key={option.title} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${option.color}`}>
                  <option.icon className="h-5 w-5 text-white" />
                </div>
                <CardTitle className="text-lg">{option.title}</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <CardDescription className="mb-4">{option.description}</CardDescription>
              <Button asChild className="w-full">
                <Link href={option.href}>Manage {option.title}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
