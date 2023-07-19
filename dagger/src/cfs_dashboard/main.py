import json
import dagger
from base64 import b64encode
from typing import Annotated
from datetime import datetime
from dagger import Doc, dag, function, object_type

@object_type
class CfsDashboard:
    @function
    def registry(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        accesskey: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secretkey: Annotated[dagger.Secret, Doc("S3 Secret Key")]
    ) -> dagger.Service:
        """Start and return a registry service."""
        return (
            dag.container()
            .from_("registry:2.8.2")
            .with_env_variable("REGISTRY_HTTP_ADDR", "0.0.0.0:80")
            .with_secret_variable("REGISTRY_HTTP_SECRET", secretkey)
            .with_env_variable("REGISTRY_STORAGE", "s3")
            .with_env_variable("REGISTRY_STORAGE_S3_REGION", "default")
            .with_env_variable("REGISTRY_STORAGE_S3_BUCKET", bucket)
            .with_env_variable("REGISTRY_STORAGE_S3_REGIONENDPOINT", endpoint)
            .with_secret_variable("REGISTRY_STORAGE_S3_ACCESSKEY", accesskey)
            .with_secret_variable("REGISTRY_STORAGE_S3_SECRETKEY", secretkey)
            .with_exposed_port(80)
            .as_service()
        )

    @function
    async def values(
        self,
        gitlab: Annotated[str, Doc("Gitlab address")],
        username: Annotated[str, Doc("Repository username")],
        password: Annotated[dagger.Secret, Doc("Repository password")],
    ) -> dagger.Directory:
        """Clone helm chart values for external secrets operator."""
        token = await password.plaintext()
        return await (
            dag.container()
            .from_("alpine/helm")
            .with_workdir("/src")
            .with_exec(
                [
                    "git",
                    "clone",
                    f"https://{username}:{token}@{gitlab}/eo4eu/eo4eu-infastructure/fleet/external-secrets-operator.git"
                ]
            )
            .directory(f"/src/external-secrets-operator")
        )

    @function
    async def operator(
        self,
        name: Annotated[str, Doc("k3s server name")],
        gitlab: Annotated[str, Doc("Gitlab address")],
        username: Annotated[str, Doc("Repository username")],
        password: Annotated[dagger.Secret, Doc("Repository password")],
        k3sc: Annotated[dagger.Container, Doc("k3s Container")]
    ) -> str:
        """Deploy external secrets operator on k3s."""
        var_cache = dag.cache_volume(f"{name}_var")
        etc_cache = dag.cache_volume(f"{name}_etc")
        k3ss = dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1").with_container(k3sc)
        k3sv = await self.values(gitlab, username, password)
        return await (
            dag.container()
            .from_("alpine/helm")
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_service_binding(
                "kubernetes",
                k3ss.server()
            )
            .with_exec(["apk", "add", "kubectl"])
            .with_env_variable("KUBECONFIG", "/etc/rancher/k3s/config")
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
            .with_directory("/src/external-secrets-operator", k3sv)
            .with_exec(
              [
                  "sed",
                  "-e",
                  "s|server: https://.*:6443|server: https://kubernetes:6443|",
                  "/etc/rancher/k3s/k3s.yaml"
              ],
              redirect_stdout="/etc/rancher/k3s/config"
            )
            .with_exec(
                [
                    "kubectl",
                    "config",
                    "set-cluster",
                    "default",
                    "--certificate-authority=/var/lib/rancher/k3s/server/tls/server-ca.crt"
                ]
            )
            .with_exec(
                [
                    "helm",
                    "repo",
                    "add",
                    "external-secrets",
                    "https://charts.external-secrets.io"
                ]
            )
            .with_exec(
                [
                    "helm",
                    "install",
                    "external-secrets",
                    "external-secrets/external-secrets",
                    "-n",
                    "external-secrets-operator",
                    "--create-namespace",
                    "--version",
                    "0.9.11",
                    "-f",
                    "/src/external-secrets-operator/operator/values.yaml"
                ]
            )
            .stdout()
        )

    @function
    async def store(
        self,
        name: Annotated[str, Doc("k3s server name")],
        gitlab: Annotated[str, Doc("Gitlab address")],
        username: Annotated[str, Doc("Repository username")],
        password: Annotated[dagger.Secret, Doc("Repository password")],
        k3sc: Annotated[dagger.Container, Doc("k3s Container")]
    ) -> str:
        """Deploy cluster secret store on k3s."""
        var_cache = dag.cache_volume(f"{name}_var")
        etc_cache = dag.cache_volume(f"{name}_etc")
        k3ss = dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1").with_container(k3sc)
        k3sv = await self.values(gitlab, username, password)
        return await (
            dag.container()
            .from_("alpine/helm")
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_service_binding(
                "kubernetes",
                k3ss.server()
            )
            .with_exec(["apk", "add", "kubectl"])
            .with_env_variable("KUBECONFIG", "/etc/rancher/k3s/config")
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
            .with_directory("/src/external-secrets-operator", k3sv)
            .with_exec(
              [
                  "sed",
                  "-e",
                  "s|server: https://.*:6443|server: https://kubernetes:6443|",
                  "/etc/rancher/k3s/k3s.yaml"
              ],
              redirect_stdout="/etc/rancher/k3s/config"
            )
            .with_exec(
                [
                    "kubectl",
                    "config",
                    "set-cluster",
                    "default",
                    "--certificate-authority=/var/lib/rancher/k3s/server/tls/server-ca.crt"
                ]
            )
            .with_exec(
                [
                    "kubectl",
                    "-n",
                    "external-secrets-operator",
                    "wait",
                    "--timeout",
                    "1h",
                    "--for=jsonpath={.status.availableReplicas}=1",
                    "deploy",
                    "-l",
                    "app.kubernetes.io/instance=external-secrets"
                ]
            )            
            .with_exec(
                [
                    "kubectl",
                    "apply",
                    "-f",
                    "/src/external-secrets-operator/secret-store/deployments/flux-approle-secret.yaml"
                ]
            )
            .with_exec(
                [
                    "kubectl",
                    "apply",
                    "-f",
                    "/src/external-secrets-operator/secret-store/deployments/flux-secret-store.yaml"
                ]
            )
            .stdout()
        )

    @function
    async def update(
        self,
        gitlab: Annotated[str, Doc("Gitlab address")],
        chart: Annotated[str, Doc("Helm chart name")],
        branch: Annotated[str, Doc("Service branch")],
        username: Annotated[str, Doc("Repository username")],
        password: Annotated[dagger.Secret, Doc("Repository password")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> dagger.Directory:
        """Create helm chart from cookiecutter template."""
        token = await password.plaintext()
        return await (
            dag.container()
            .from_("harness/cookiecutter:latest")
            .with_directory("/src", wkd)
            .with_workdir("/src")
            .with_exec(
                [
                    "cookiecutter",
                    "--no-input",
                    "--config-file",
                    "cookiecutter-config.yaml",
                    "--checkout",
                    f"{branch}",
                    f"https://{username}:{token}@{gitlab}/eo4eu/eo4eu-cicd/cicd-infra/cookiecutter-helm-template.git"
                ]
            )
            .directory(f"/src/{chart}")
        )

    @function
    async def updatest(
        self,
        gitlab: Annotated[str, Doc("Gitlab address")],
        chart: Annotated[str, Doc("Helm chart name")],
        branch: Annotated[str, Doc("Service branch")],
        repo: Annotated[str, Doc("Repo name")],
        tag: Annotated[str, Doc("Image tag")],
        username: Annotated[str, Doc("Repository username")],
        password: Annotated[dagger.Secret, Doc("Repository password")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> dagger.Directory:
        """Create helm chart from cookiecutter template."""
        token = await password.plaintext()
        return await (
            dag.container()
            .from_("harness/cookiecutter:latest")
            .with_directory("/src", wkd)
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_workdir("/chart")
            .with_exec(
                [
                    "sed",
                    "-i",
                    f"s/\\(  deployment_image_repo: \"\\)\\(.*\\)/\\1registry.local:80\\/{repo}\"/g",
                    "/src/cookiecutter-config.yaml"
                ]
            )
            .with_exec(
                [
                    "sed",
                    "-i",
                    f"s/\\(  deployment_image_tag: \"\\)\\(.*\\)/\\1{tag}\"/g",
                    "/src/cookiecutter-config.yaml"
                ]
            )
            .with_exec(
                [
                    "cookiecutter",
                    "--no-input",
                    "--config-file",
                    "/src/cookiecutter-config.yaml",
                    "--checkout",
                    f"{branch}",
                    f"https://{username}:{token}@{gitlab}/eo4eu/eo4eu-cicd/cicd-infra/cookiecutter-helm-template.git"
                ]
            )
            .directory("/chart")
        )

    @function
    async def setupk3sc(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        name: Annotated[str, Doc("k3s server name")],
        chart: Annotated[str, Doc("Helm chart name")],
        repo: Annotated[str, Doc("Repo name")],
        k3sd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing cookiecutter files"),
        ],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> dagger.Container:
        """Setup container for k3s cluster."""
        var_cache = dag.cache_volume(f"{name}_var")
        etc_cache = dag.cache_volume(f"{name}_etc")
        return await (
            dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1")
            .container()
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret)
            )
            .with_directory("/chart", k3sd)
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
            .with_exec(
                [
                    "awk",
                    "/registry.local/ {printf \"  %s\", $1}",
                    "/etc/hosts"
                ],
                redirect_stdout="/etc/rancher/k3s/registries.yaml"
            )
            .with_exec(
                [
                    "awk",
                    "/registry.local/ {printf \"      - http://%s:80\\n\", $1}",
                    "/etc/hosts"
                ],
                redirect_stdout="/tmp/ip_address.yaml"
            )
            .with_exec(
                [
                    "sed",
                    "-i",
                    "1s/^/mirrors:\\n/",
                    "/etc/rancher/k3s/registries.yaml"
                ]
            )
            .with_exec(
                [
                    "sed",
                    "-i",
                    "-e",
                    "$s/$/:80:\\n     endpoint:/",
                    "-e",
                    "$r /tmp/ip_address.yaml",                   
                    "/etc/rancher/k3s/registries.yaml"
                ]
            )
            .with_exec(
                [
                    "awk",
                    f"/registry.local/ {{printf \"    repository: %s:80/{repo}\", $1}}",
                    "/etc/hosts"
                ],
                redirect_stdout="/tmp/ip_address.yaml"
            )
            .with_exec(
                [
                    "sed",
                    "-i",
                    "-e",
                    "/registry.local/r /tmp/ip_address.yaml",
                    "-e",
                    "/registry.local/d",                   
                    f"/chart/{chart}/values.yaml"
                ]
            )
        )

    @function
    async def install(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        name: Annotated[str, Doc("k3s server name")],
        gitlab: Annotated[str, Doc("Gitlab address")],
        chart: Annotated[str, Doc("Helm chart name")],
        namespace: Annotated[str, Doc("Helm chart namespace")],
        branch: Annotated[str, Doc("Service branch")],
        repo: Annotated[str, Doc("Repo name")],
        tag: Annotated[str, Doc("Image tag")],
        username: Annotated[str, Doc("Repository username")],
        password: Annotated[dagger.Secret, Doc("Repository password")],
        user: Annotated[str, Doc("External secret username")],
        pwd: Annotated[dagger.Secret, Doc("External secret password")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> str:
        """Deploy helm chart on k3s cluster."""
        var_cache = dag.cache_volume(f"{name}_var")
        etc_cache = dag.cache_volume(f"{name}_etc")
        k3sd = await self.updatest(gitlab, chart, branch, repo, tag, username, password, wkd)
        k3sc = await self.setupk3sc(bucket, endpoint, access, secret, name, chart, repo, k3sd, wkd)
        k3ss = dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1").with_container(k3sc)
        k3so = await self.operator(name, gitlab, user, pwd, k3sc)
        k3st = await self.store(name, gitlab, user, pwd, k3sc)
        return await (
            dag.container()
            .from_("alpine/helm")
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_service_binding(
                "kubernetes",
                k3ss.server()
            )
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret)
            ) 
            .with_exec(["apk", "add", "kubectl"])
            .with_env_variable("KUBECONFIG", "/etc/rancher/k3s/config")
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
            .with_directory("/chart", k3sc.directory("/chart"))
            .with_exec(
              [
                  "sed",
                  "-e",
                  "s|server: https://.*:6443|server: https://kubernetes:6443|",
                  "/etc/rancher/k3s/k3s.yaml"
              ],
              redirect_stdout="/etc/rancher/k3s/config"
            )
            .with_exec(
                [
                    "kubectl",
                    "config",
                    "set-cluster",
                    "default",
                    "--certificate-authority=/var/lib/rancher/k3s/server/tls/server-ca.crt"
                ]
            )
            .with_exec(
                [
                    "helm",
                    "install",
                    f"{chart}",
                    "--wait",
                    "--debug",
                    f"/chart/{chart}",
                    "-f",
                    f"/chart/{chart}/values.yaml",
                    "-n",
                    f"{namespace}",
                    "--create-namespace"
                ]
            )
            .stdout()
        )
    
    @function
    async def test(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        name: Annotated[str, Doc("k3s server name")],
        gitlab: Annotated[str, Doc("Gitlab address")],
        chart: Annotated[str, Doc("Helm chart name")],
        namespace: Annotated[str, Doc("Helm chart namespace")],
        branch: Annotated[str, Doc("Service branch")],
        repo: Annotated[str, Doc("Repo name")],
        tag: Annotated[str, Doc("Image tag")],
        username: Annotated[str, Doc("Cookiecutter username")],
        password: Annotated[dagger.Secret, Doc("Cookiecutter password")],
        user: Annotated[str, Doc("External secret username")],
        pwd: Annotated[dagger.Secret, Doc("External secret password")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> str:
        """Test application deployed on k3s."""
        var_cache = dag.cache_volume(f"{name}_var")
        etc_cache = dag.cache_volume(f"{name}_etc")
        k3sc = (
            dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1")
            .container()
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
        )
        k3ss = dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1").with_container(k3sc)
        k3si = await self.install(bucket, endpoint, access, secret, name, gitlab, 
        chart, namespace, branch, repo, tag, username, password, user, pwd, wkd)
        return await (
            dag.container()
            .from_("alpine/helm")
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_service_binding(
                "kubernetes",
                k3ss.server()
            )
            .with_exec(["apk", "add", "kubectl"])
            .with_env_variable("KUBECONFIG", "/etc/rancher/k3s/config")
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
            .with_exec(
              [
                  "sed",
                  "-e",
                  "s|server: https://.*:6443|server: https://kubernetes:6443|",
                  "/etc/rancher/k3s/k3s.yaml"
              ],
              redirect_stdout="/etc/rancher/k3s/config"
            )
            .with_exec(
                [
                    "kubectl",
                    "config",
                    "set-cluster",
                    "default",
                    "--certificate-authority=/var/lib/rancher/k3s/server/tls/server-ca.crt"
                ]
            )
            .with_exec(
                [
                    "kubectl",
                    "-n",
                    f"{namespace}",
                    "logs",
                    "-l",
                    f"app={chart}"
                ]
            )
            .stdout()
        )

    @function
    async def server(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        name: Annotated[str, Doc("k3s server name")],
        chart: Annotated[str, Doc("Helm chart name")],
        namespace: Annotated[str, Doc("Helm chart namespace")],
    ) -> str:
        """Get address for application deployed on k3s."""
        var_cache = dag.cache_volume(f"{name}_var")
        etc_cache = dag.cache_volume(f"{name}_etc")
        k3sc = (
            dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1")
            .container()
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
        )
        k3ss = dag.k3_s(name,image="rancher/k3s:v1.32.1-k3s1").with_container(k3sc)
        return await (
            dag.container()
            .from_("alpine/helm")
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_service_binding(
                "kubernetes",
                k3ss.server()
            )
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret)
            )
            .with_exec(["apk", "add", "kubectl"])
            .with_env_variable("KUBECONFIG", "/etc/rancher/k3s/config")
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
            .with_exec(
              [
                  "sed",
                  "-e",
                  "s|server: https://.*:6443|server: https://kubernetes:6443|",
                  "/etc/rancher/k3s/k3s.yaml"
              ],
              redirect_stdout="/etc/rancher/k3s/config"
            )
            .with_exec(
                [
                    "kubectl",
                    "config",
                    "set-cluster",
                    "default",
                    "--certificate-authority=/var/lib/rancher/k3s/server/tls/server-ca.crt"
                ]
            )
            .with_exec(
                [
                    "kubectl",
                    "-n",
                    f"{namespace}",
                    "describe",
                    "-l",
                    f"app={chart}"
                ]
            )
            .stdout()
        )

    @function
    async def delete(
        self,
        name: Annotated[str, Doc("k3s server name")],
        chart: Annotated[str, Doc("Helm chart name")],
        namespace: Annotated[str, Doc("Helm chart namespace")],
    ) -> str:
        """Delete helm chart on k3s cluster."""
        var_cache = dag.cache_volume(f"{name}_var")
        etc_cache = dag.cache_volume(f"{name}_etc")
        return await (
            dag.container()
            .from_("alpine/helm")
            .with_env_variable("CACHEBUSTER", str(datetime.now()))
            .with_exec(["apk", "add", "kubectl"])
            .with_mounted_cache("/var/lib/rancher/k3s", var_cache)
            .with_mounted_cache("/etc/rancher/k3s", etc_cache)
            .with_exec(
                [
                    "find",
                    "/var/lib/rancher/k3s",
                    "-type",
                    "f",
                    "-delete"
                ]
            )
            .with_exec(
                [
                    "find",
                    "/etc/rancher/k3s",
                    "-type",
                    "f",
                    "-delete"
                ]
            )
            .stdout()
        )

    @function
    async def build(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        repo: Annotated[str, Doc("Registry repo")],
        tag: Annotated[str, Doc("Image tag")],
        dockerfile: Annotated[str, Doc("Dockerfile")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> str:
        """Build and publish image from existing Dockerfile"""
        return await (
            dag.container(platform=dagger.Platform("linux/amd64"))
            .from_("gcr.io/kaniko-project/executor:debug")
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret)
            ) 
            .with_mounted_directory("/workspace", wkd)
            .with_exec(
                [
                    "/kaniko/executor",
                    "--context", 
                    "dir:///workspace/",
                    "--dockerfile",
                    f"/workspace/{dockerfile}",
                    "--insecure",
                    "--destination",
                    f"registry.local/{repo}:{tag}"
                ]
            )
            .stdout()
        )
    
    @function
    async def scan(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        severity: Annotated[str, Doc("Severity level")],
        exit: Annotated[str, Doc("Exit code")],
        repo: Annotated[str, Doc("Registry repo")],
        tag: Annotated[str, Doc("Image tag")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> dagger.File:
        """Scan image to detect vulnerabilities"""
        template = (
            dag.container()
            .from_("alpine:latest")
            .with_directory("/src", wkd)
            .with_workdir("/src")
            .with_exec(
                [
                    "wget",
                    "https://raw.githubusercontent.com/aquasecurity/trivy/refs/heads/main/contrib/html.tpl"
                ]
            )
        )
        return await (
            dag.trivy().base()
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret)
            )
            .with_directory("/src", wkd)
            .with_file("/src/html.tpl", template.file("/src/html.tpl"))
            .with_exec(
                [
                    "trivy",
                    "image",
                    "--db-repository",
                    "public.ecr.aws/aquasecurity/trivy-db",
                    "--java-db-repository",
                    "public.ecr.aws/aquasecurity/trivy-java-db",
                    "--exit-code",
                    exit,
                    "--severity",
                    severity,
                    "--format",
                    "template",
                    "--template",
                    "@/src/html.tpl",
                    "--output",
                    f"/src/vulnerabilities.html",
                    "--insecure",
                    f"registry.local/{repo}:{tag}"
                ]
            )
            .file(f"/src/vulnerabilities.html")
        )

    @function
    async def fix(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        repo: Annotated[str, Doc("Registry repo")],
        tag: Annotated[str, Doc("Image tag")],
        severity: Annotated[str, Doc("Severity levels (comma separated)")],
        blbuild: Annotated[str, Doc("List of build blacklisted images")] | None,
        blscan: Annotated[str, Doc("List of scan blacklisted images")],
        wkd: Annotated[dagger.Directory, Doc("Directory with Dockerfile")],
    ) -> dagger.Directory:
        """Scan image, analyze vulnerabilities, and propose Dockerfile fixes"""
        scan = (
            dag.trivy().base()
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret),
            )
            .with_directory("/src", wkd)
            .with_exec(
                [
                    "trivy",
                    "image",
                    "--db-repository",
                    "public.ecr.aws/aquasecurity/trivy-db",
                    "--java-db-repository",
                    "public.ecr.aws/aquasecurity/trivy-java-db",
                    "--severity",
                    severity,
                    "--format",
                    "json",
                    "--output",
                    "/src/vulnerabilities.json",
                    "--insecure",
                    f"registry.local/{repo}:{tag}"
                ]
            )
            .file("/src/vulnerabilities.json")
        )

        raw_json = await scan.contents()
        findings = json.loads(raw_json)

        simplified = []
        for res in findings.get("Results", []):
            for vuln in res.get("Vulnerabilities", []):
                simplified.append({
                    "CVE": vuln.get("VulnerabilityID"),
                    "Package": vuln.get("PkgName"),
                    "Installed": vuln.get("InstalledVersion"),
                    "Fixed": vuln.get("FixedVersion"),
                    "Severity": vuln.get("Severity"),
                    "Title": vuln.get("Title"),
                })

        simplified = simplified[:50]
        blscan_images = [s.strip() for s in blscan.split(",")]
        if blbuild:
            blbuild_images = [s.strip() for s in blbuild.split(",")]
        else:
            blbuild_images = ""

        dockerfile = await wkd.file("Dockerfile").contents()
        prompt = f"""
You are a DevSecOps expert.
You are given:

- A Dockerfile:

--- Dockerfile ---
$dockerfile

- A vulnerabilities report:

--- Vulnerabilities (Top {len(simplified)}) ---
$vulnerabilities

- A blacklist of base images that failed to build:

--- Build Blacklisted images ---
$build_blacklisted_images

- A blacklist of base images that include critical vulnerabilities:

--- Scan Blacklisted images ---
$scan_blacklisted_images

Task:
- Propose a fixed Dockerfile that mitigates the listed vulnerabilities.
- Change base images if critical vulnerabilities are present.
- Use Alpine 3.20+ and Ubuntu 22.04+ base images. Avoid pure Debian images.
- Prioritize Alpine and Ubuntu tags of original base images with respect to plain Alpine and Ubuntu base images.
- If pip is called on Alpine 3.20+ or Ubuntu 23+ images, use option break-system-packages.
- Do not use ldconfig on Alpine 3.20+. Find alternatives if needed.
- For Debian and Ubuntu images, remember to set "ENV DEBIAN_FRONTEND=noninteractive".
- Make sure that your changes do not break build process and the updated image manifests exist.
- Upgrade or replace vulnerable packages.
- Preserve app functionality.
- Do not downgrade originally installed packages.
- Keep images minimal and production-ready.

Write ONLY the fixed Dockerfile to $fixed_dockerfile.
"""

        env = (
            dag.env()
            .with_string_input("vulnerabilities", json.dumps(simplified, indent=2), "The vulnerabilities report")
            .with_string_input("dockerfile", dockerfile, "The original Dockerfile")
            .with_string_input("build_blacklisted_images", str(blbuild_images), "The list of build blacklisted images")
            .with_string_input("scan_blacklisted_images", str(blscan_images), "The list of scan blacklisted images")
            .with_string_output("fixed_dockerfile", "The updated Dockerfile with fixes applied")
        )

        work = (
            dag.llm()
            .with_env(env)
            .with_prompt(prompt)
        )

        result = await work

        updated_text = await result.env().output("fixed_dockerfile").as_string()

        if not updated_text:
            updated_text = dockerfile

        fixed_file = (
            dag.directory()
            .with_new_file("Dockerfile.updated", updated_text)
            .file("Dockerfile.updated")
        )

        return fixed_file

    @function
    async def sbom(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        repo: Annotated[str, Doc("Registry repo")],
        tag: Annotated[str, Doc("Image tag")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> dagger.File:
        """Scan image and produce SBOM file"""
        return await (
            dag.trivy().base()
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret)
            )
            .with_directory("/src", wkd)
            .with_exec(
                [
                    "trivy",
                    "image",
                    "--db-repository",
                    "public.ecr.aws/aquasecurity/trivy-db",
                    "--java-db-repository",
                    "public.ecr.aws/aquasecurity/trivy-java-db",
                    "--exit-code",
                    "0",
                    "--format",
                    "cyclonedx",
                    "--output",
                    f"/src/sbom-report.cdx.json",
                    "--insecure",
                    f"registry.local/{repo}:{tag}"
                ]
            )
            .file(f"/src/sbom-report.cdx.json")
        )

    @function
    async def encode(
        self,
        registry: Annotated[str, Doc("Registry address")],
        username: Annotated[str, Doc("Registry username")],
        password: Annotated[dagger.Secret, Doc("Registry password")],
    ) -> dagger.Secret:
        """Encode username and password in base64."""
        token = await password.plaintext()
        auth_blob = b64encode(f"{username}:{token}".encode("utf-8")).decode("utf-8")

        return dagger.Client().set_secret(
            "ci_blob",
            json.dumps({"auths": {
                registry: {"auth": auth_blob},
            }})
        )

    @function
    async def push(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
        registry: Annotated[str, Doc("Registry address")],
        namespace: Annotated[str, Doc("Registry namespace")],
        repo: Annotated[str, Doc("Registry repo")],
        srctag: Annotated[str, Doc("Source image tag")],
        dsttag: Annotated[str, Doc("Destination image tag")],
        username: Annotated[str, Doc("Registry username")],
        password: Annotated[dagger.Secret, Doc("Registry password")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> str:
        """Build and publish image from existing Dockerfile"""
        auth_blob: dagger.Secret = await self.encode(registry, username, password)
        return await (
            dag.container(platform=dagger.Platform("linux/amd64"))
            .with_service_binding(
                "registry.local",
                self.registry(bucket, endpoint, access, secret)
            )
            .from_("rapidfort/skopeo-ib:v1.16.1")
            .with_mounted_secret("/tmp/config.json", auth_blob, owner = "1000:1000")
            .with_exec(
                [
                    "skopeo",
                    "copy",
                    "--src-tls-verify=false",
                    "--src-no-creds",
                    "--dest-authfile",
                    "/tmp/config.json",
                    f"docker://registry.local/{repo}:{srctag}",
                    f"docker://{registry}/{namespace}/{repo}:{dsttag}"
                ]
            )
            .stdout()
        )

    @function
    async def update(
        self,
        gitlab: Annotated[str, Doc("Gitlab address")],
        chart: Annotated[str, Doc("Helm chart name")],
        branch: Annotated[str, Doc("Service branch")],
        username: Annotated[str, Doc("Repository username")],
        password: Annotated[dagger.Secret, Doc("Repository password")],
        wkd: Annotated[
            dagger.Directory,
            Doc("Location of directory containing Dagger files"),
        ],
    ) -> dagger.Directory:
        """Create helm chart from cookiecutter template"""
        token = await password.plaintext()
        return await (
            dag.container()
            .from_("harness/cookiecutter:latest")
            .with_directory("/src", wkd)
            .with_workdir("/src")
            .with_exec(
                [
                    "cookiecutter",
                    "--no-input",
                    "--config-file",
                    "cookiecutter-config.yaml",
                    "--checkout",
                    f"{branch}",
                    f"https://{username}:{token}@{gitlab}/eo4eu/eo4eu-cicd/cicd-infra/cookiecutter-helm-template.git"
                ]
            )
            .directory(f"/src/{chart}")
        )

    @function
    async def clean(
        self,
        bucket: Annotated[str, Doc("S3 Bucket")],
        endpoint: Annotated[str, Doc("S3 Endpoint")],
        access: Annotated[dagger.Secret, Doc("S3 Access Key")],
        secret: Annotated[dagger.Secret, Doc("S3 Secret Key")],
    ) -> str:
        """Clean local registry."""
        return await (
            dag.container()
            .from_("amazon/aws-cli")
            .with_secret_variable("AWS_ACCESS_KEY_ID", access)
            .with_secret_variable("AWS_SECRET_ACCESS_KEY", secret)
            .with_exec(
                [
                    "aws",
                    "--endpoint-url",
                    f"{endpoint}",
                    "s3",
                    "rm",
                    f"s3://{bucket}/docker",
                    "--recursive"
                ]
            )
            .stdout()
        )