import awsLogo from "../../assets/aws.svg";
import kubernetesLogo from "../../assets/kubernetes.svg";
import pythonLogo from "../../assets/python.svg";
import terraformLogo from "../../assets/terraform.svg";
import reactLogo from "../../assets/react.svg";

export function AboutSection() {
  const skills = [
    {
      icon: awsLogo,
      title: "AWS services",
      description:
        "Working with AWS services (EC2, IAM, S3, Lambda basics) and applying best practices in cost control, high availability, and security.",
    },
    {
      icon: [pythonLogo, reactLogo],
      title: "Automation and web development",
      description:
        "Building automated scripts and website with FastAPI, React and Django.",
    },
    {
      icon: kubernetesLogo,
      title: "Container orchestration",
      description: "Manage and deploy containerized applications.",
    },
    {
      icon: terraformLogo,
      title: "Infrastructure",
      description: "Design and build infrastructure using Terraform",
    },
  ];
  return (
    <section id="about" className="min-h-screen bg-white py-20">
      <div className="max-w-7xl mx-auto px-6">
        <h2 className="text-5xl font-bold text-[#00003d] mb-4">About me</h2>
        <div className="w-20 h-1 bg-[#d4c896] mb-12"></div>
        <div className="grid md:grid-cols-2 gap-12 mb-16">
          <div className="space-y-4">
            <p className="text-gray-700 text-lg leading-relaxed">
              I'm a DevOps Engineer with 1 year of hands-on experience in
              AWS-based infrastructure, Gitlab CI/CD, and container
              orchestration by using Kubernetes and Docker. Strong background in
              cloud deployment, infrastructure as code, and system reliability.
              AWS Solutions Architect Associate certified. Focused on building
              secure, scalable and automation-driven environments that reduce
              manual operations and improve delivery speed.
            </p>
            <p className="text-gray-700 text-lg leading-relaxed">
              Some highlights of my experience includes:
            </p>
          </div>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {skills.map((skill) => {
            const icons = Array.isArray(skill.icon) ? skill.icon : [skill.icon];

            return (
              <div
                key={skill.title}
                className="p-6 bg-[#f5f3e8] rounded-lg hover:shadow-lg transition-shadow"
              >
                <div className="flex items-center gap-3 mb-4">
                  {icons.map((src, idx) => (
                    <img
                      key={`${skill.title}-icon-${idx}`}
                      src={src}
                      alt={`${skill.title} icon ${idx + 1}`}
                      className={icons.length > 1 ? "w-10 h-10" : "w-12 h-12"}
                    />
                  ))}
                </div>

                <h3 className="text-xl font-semibold text-[#00003d] mb-2">
                  {skill.title}
                </h3>
                <p className="text-gray-700">{skill.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
