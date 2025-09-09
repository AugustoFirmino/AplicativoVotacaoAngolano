import { useRouter } from "expo-router";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function Index() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      {/* Logo ou bandeira */}
      <Image
        source={require("../assets/images/bandeira_angola.png")}
        style={styles.logo}
        resizeMode="contain"
      />

      {/* Nome do app */}
      <Text style={styles.title}>Votação Angolana</Text>
      <Text style={styles.subtitle}>Exerça o seu direito de votar</Text>

      {/* Botão para login */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("/login")}
      >
        <Text style={styles.buttonText}>Entrar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#d32f2f", // vermelho angolano
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  logo: {
    width: 150,
    height: 150,
    marginBottom: 30,
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: "#f5f5f5",
    marginBottom: 40,
    textAlign: "center",
  },
  button: {
    backgroundColor: "#000", // preto angolano
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
});
