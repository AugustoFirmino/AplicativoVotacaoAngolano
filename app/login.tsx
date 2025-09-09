import { useRouter } from "expo-router";
import { useState } from "react";
import {
    Alert,
    Image,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

export default function Login() {
  const router = useRouter();
  const [bi, setBi] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Validação da palavra-passe
  const validarPassword = (senha: string) => {
    const regex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%&*?])[A-Za-z\d!@#$%&*?]{1,12}$/;
    return regex.test(senha);
  };

  // Validação do BI (12 números + 2 letras)
  const validarBI = (valor: string) => {
    const regex = /^(?=(?:.*[A-Za-z]){2})(?=(?:.*\d){12})[A-Za-z0-9]{14}$/;
    return regex.test(valor);
  };

  const handleLogin = () => {
    if (!bi || !password) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    // Validação do BI
    if (!validarBI(bi)) {
      Alert.alert(
        "Erro",
        "O número do BI deve ter 14 caracteres: 12 dígitos e 2 letras (ex: 010065116LA049)."
      );
      return;
    }

    // Validação da senha
    if (!validarPassword(password)) {
      Alert.alert(
        "Erro",
        "A palavra-passe deve ter até 12 caracteres, contendo:\n\n• 1 letra maiúscula\n• 1 letra minúscula\n• 1 número\n• 1 caractere especial"
      );
      return;
    }

    // Aqui podes integrar com backend para validar login
    router.push("/votar"); // vai para tela de votação
  };

  return (
    <View style={styles.container}>
      {/* Logo / Bandeira */}
      <Image
        source={require("../assets/images/bandeira_angola.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Acesso à Votação</Text>
      <Text style={styles.subtitle}>Digite o seu BI e Palavra-passe</Text>

      {/* Campo BI */}
      <TextInput
        style={styles.input}
        placeholder="Número do BI (ex: 000000000LA000)"
        placeholderTextColor="#ccc"
        value={bi}
        onChangeText={(text) => {
          // Aceita apenas números e letras
          const filtro = text.replace(/[^0-9a-zA-Z]/g, "");
          setBi(filtro.toUpperCase()); // sempre maiúsculas
        }}
        maxLength={14}
        keyboardType="default"
      />

      {/* Campo Palavra-passe */}
      <View style={styles.passwordContainer}>
        <TextInput
          style={styles.inputPassword}
          placeholder="Palavra-passe"
          placeholderTextColor="#ccc"
          secureTextEntry={!showPassword}
          value={password}
          onChangeText={setPassword}
          maxLength={12}
        />
        <TouchableOpacity
          onPress={() => setShowPassword(!showPassword)}
          style={styles.showButton}
        >
          <Text style={styles.showButtonText}>
            {showPassword ? "Ocultar" : "Mostrar"}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Botão Entrar */}
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>

      {/* Rodapé */}
      <Text style={styles.footerText}>
        Sistema de Votação Digital Angolano
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d32f2f",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    marginBottom: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 14,
    color: "#f5f5f5",
    marginBottom: 30,
  },
  input: {
    width: "100%",
    backgroundColor: "#000",
    color: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
  passwordContainer: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#000",
    borderRadius: 8,
    marginBottom: 20,
  },
  inputPassword: {
    flex: 1,
    color: "#fff",
    padding: 12,
    fontSize: 16,
  },
  showButton: {
    paddingHorizontal: 12,
    justifyContent: "center",
  },
  showButtonText: {
    color: "#FFD700",
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#FFD700",
    paddingVertical: 14,
    paddingHorizontal: 50,
    borderRadius: 25,
    marginBottom: 20,
  },
  buttonText: {
    color: "#000",
    fontSize: 18,
    fontWeight: "bold",
  },
  footerText: {
    marginTop: 30,
    color: "#fff",
    fontSize: 12,
  },
});
