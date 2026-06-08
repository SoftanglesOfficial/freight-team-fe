import Image from "next/image";
import Link from "next/link";

export default function Logo({ width = 120 }: { width?: number }) {
    return (
        <Link href="/" style={{ textDecoration: "none", marginBottom: "32px" }}>
            <img src="/logo.png" alt="Logo" width={width} />
        </Link>
    );
}