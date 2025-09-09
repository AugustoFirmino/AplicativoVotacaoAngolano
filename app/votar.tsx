// app/votar.tsx
import { useRouter } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
    Alert,
    FlatList,
    Image,
    LogBox,
    Modal,
    Platform,
    Pressable,
    SafeAreaView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming,
} from "react-native-reanimated";

/* ------------------- SUPRIMIR WARNING Reanimated ------------------- */
LogBox.ignoreLogs([
  "Reduced motion setting is enabled on this device",
]);

/* ------------------- DADOS DE EXEMPLO ------------------- */
const CANDIDATOS = [
  {
    id: "c1",
    nome: "João Manuel Gonçalves Lourenço",
    partido: "Movimento Popular de Libertação de Angola",
    sigla: "MPLA",
    partidoColor: "#FF0000",
    votos: 1250,
    foto: require("../assets/images/joaolourenco.jpeg"),
    icon: require("../assets/images/mpla.png"),
    objetivo:
      "Promover a estabilidade, crescimento económico e investimentos em infraestrutura.",
  },
  {
    id: "c2",
    nome: "Adalberto da Costa Júnior",
    partido: "União Nacional para a Independência Total de Angola",
    sigla: "UNITA",
    partidoColor: "#008000",
    votos: 24000,
    foto: require("../assets/images/aldabertocostajunior.jpg"),
    icon: require("../assets/images/unita.png"),
    objetivo:
      "Defender a democracia, criar empregos e melhorar a qualidade da educação e saúde.",
  },
  {
    id: "c3",
    nome: "Lucas Ngonda",
    partido: "Frente Nacional de Libertação de Angola",
    sigla: "FNLA",
    partidoColor: "#0000FF",
    votos: 900000,
    foto: require("../assets/images/lucasngonda.jpeg"),
    icon: require("../assets/images/fnla.png"),
    objetivo:
      "Unir o país e garantir maior inclusão social e desenvolvimento comunitário.",
  },
  {
    id: "c4",
    nome: "Abel Chivukuvuku",
    partido: "Pra Já Servir Angola",
    sigla: "PRA-JÁ",
    partidoColor: "#800080",
    votos: 0,
    foto: require("../assets/images/abelchivucuvucu.jpeg"),
    icon: require("../assets/images/prajaservirangola.png"),
    objetivo:
      "Construir um futuro de esperança, justiça social e desenvolvimento inclusivo para todos os angolanos.",
  },
];

/* ------------------- FUNÇÃO FORMATAR NÚMEROS ------------------- */
function formatarVotos(num: number): string {
  if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(1) + "B";
  if (num >= 1_000_000) return (num / 1_000_000).toFixed(1) + "M";
  if (num >= 1_000) return (num / 1_000).toFixed(1) + "K";
  return num.toString();
}

/* ------------------- COMPONENTE PRINCIPAL ------------------- */
export default function Votar() {
  const router = useRouter();

  const [candidatos, setCandidatos] = useState(CANDIDATOS.map((c) => ({ ...c })));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [hasVoted, setHasVoted] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detalhes, setDetalhes] = useState<{ nome: string; objetivo: string } | null>(null);

  /* ------------------- CONTADOR DE TEMPO ------------------- */
  const [tempoRestante, setTempoRestante] = useState(300); // 5 minutos em segundos
  const tempoExpirou = tempoRestante <= 0;

  useEffect(() => {
    if (tempoRestante <= 0) return;
    const timer = setInterval(() => setTempoRestante((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [tempoRestante]);

  const formatarTempo = (segundos: number) => {
    const min = Math.floor(segundos / 60);
    const sec = segundos % 60;
    return `${min.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
  };

  const totalVotos = useMemo(
    () => candidatos.reduce((s, c) => s + (c.votos || 0), 0),
    [candidatos]
  );

  /* ------------------- ANIMAÇÃO DO CÍRCULO ------------------- */
  const scale = useSharedValue(1);
  const glow = useSharedValue(0.6);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 800 }),
        withTiming(1, { duration: 800 })
      ),
      -1,
      true
    );
    glow.value = withRepeat(
      withSequence(
        withTiming(0.9, { duration: 800 }),
        withTiming(0.6, { duration: 800 })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    shadowOpacity: glow.value,
  }));

  const handleSelect = (id: string) => {
    if (hasVoted || tempoExpirou) return;
    setSelectedId((prev) => (prev === id ? null : id));
  };

  const confirmarVoto = async () => {
    if (!selectedId) {
      Alert.alert("Selecione um candidato", "Por favor, escolha um candidato antes de confirmar.");
      return;
    }

    if (tempoExpirou) {
      Alert.alert("Tempo Esgotado", "O período de votação terminou.");
      return;
    }

    Alert.alert("Confirmar Voto", "Confirma que deseja votar neste candidato?", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Confirmar",
        onPress: async () => {
          setCandidatos((prev) =>
            prev.map((c) =>
              c.id === selectedId ? { ...c, votos: (c.votos || 0) + 1 } : c
            )
          );
          setHasVoted(true);
          setModalVisible(true);
        },
        style: "destructive",
      },
    ]);
  };

  const renderItem = ({ item }: { item: typeof CANDIDATOS[0] }) => {
    const percent = totalVotos > 0 ? Math.round(((item.votos || 0) / totalVotos) * 100) : 0;
    const isSelected = selectedId === item.id;

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => handleSelect(item.id)}
        style={[
          styles.card,
          isSelected && !hasVoted && !tempoExpirou ? styles.cardSelected : null,
          hasVoted || tempoExpirou ? styles.cardDisabled : null,
        ]}
      >
        <View style={styles.left}>
          <Image
            source={typeof item.foto === "number" ? item.foto : { uri: item.foto }}
            style={styles.avatar}
          />
        </View>

        <View style={styles.center}>
          <Text style={styles.nome}>{item.nome}</Text>

          <View style={styles.partidoRow}>
            <Image
              source={typeof item.icon === "number" ? item.icon : { uri: item.icon }}
              style={styles.partidoIcon}
            />
            <Text style={styles.partidoText}>
              {item.partido} • {item.sigla}
            </Text>
          </View>

          <View style={styles.progressWrap}>
            <View
              style={[
                styles.progress,
                { width: `${percent}%`, backgroundColor: item.partidoColor },
              ]}
            />
            <Text style={styles.percentText}>{percent}%</Text>
          </View>

          <View style={styles.bottomRow}>
            <TouchableOpacity
              style={styles.detailsBtn}
              onPress={() =>
                setDetalhes({ nome: item.nome, objetivo: item.objetivo })
              }
            >
              <Text style={styles.detailsBtnText}>Ver Detalhes</Text>
            </TouchableOpacity>

            <Text style={styles.votosText}>{formatarVotos(item.votos || 0)}</Text>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.page}>
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            Eleição Nacional — Votação
          </Text>
          <Text style={styles.headerSubtitle}>
            {tempoExpirou
              ? "Período de votação encerrado"
              : `Tempo restante: ${formatarTempo(tempoRestante)}`}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.buttonSmall}
          onPress={() => router.push("/resultados")}
        >
          <Text style={styles.buttonSmallText}>Ver Resultados</Text>
        </TouchableOpacity>
      </View>

      {/* CÍRCULO ANIMADO DO ANO */}
      <View style={{ alignItems: "center", marginVertical: 16 }}>
        <Animated.View style={[styles.circle, animatedStyle]}>
          <Text style={styles.circleText}>2027</Text>
        </Animated.View>
      </View>

      <FlatList
        data={candidatos}
        keyExtractor={(i) => i.id}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />

      <View style={styles.footer}>
        <Text style={styles.footerNote}>
          {hasVoted
            ? "Voto registado. Obrigado por votar!"
            : tempoExpirou
            ? "Votação encerrada."
            : "Ainda não votou."}
        </Text>

        <Pressable
          onPress={confirmarVoto}
          style={({ pressed }) => [
            styles.confirmButton,
            (pressed || !selectedId || hasVoted || tempoExpirou)
              ? styles.confirmButtonDisabled
              : null,
          ]}
          disabled={!selectedId || hasVoted || tempoExpirou}
        >
          <Text style={styles.confirmText}>
            {hasVoted
              ? "VOTADO"
              : tempoExpirou
              ? "Encerrado"
              : selectedId
              ? "Confirmar Voto"
              : "Selecione um candidato"}
          </Text>
        </Pressable>
      </View>

      {/* Modais */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Voto Registado</Text>
            <Text style={styles.modalMessage}>
              O seu voto foi registado com sucesso. Obrigado por participar.
            </Text>

            <View style={{ flexDirection: "row", marginTop: 18 }}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#000" }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={[styles.modalBtnText, { color: "#FFD700" }]}>
                  Fechar
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#FFD700", marginLeft: 10 }]}
                onPress={() => {
                  setModalVisible(false);
                  router.push("/resultados");
                }}
              >
                <Text style={[styles.modalBtnText, { color: "#000" }]}>
                  Ver Resultados
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={!!detalhes}
        animationType="fade"
        transparent
        onRequestClose={() => setDetalhes(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>{detalhes?.nome}</Text>
            <Text style={styles.modalMessage}>{detalhes?.objetivo}</Text>

            <TouchableOpacity
              style={[styles.modalBtn, { backgroundColor: "#000", marginTop: 18 }]}
              onPress={() => setDetalhes(null)}
            >
              <Text style={[styles.modalBtnText, { color: "#FFD700" }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

/* ------------------- ESTILOS ------------------- */
const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: "#F7F7F8" },
  header: {
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 12 : 18,
    paddingBottom: 12,
    backgroundColor: "#d32f2f",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerTitle: { color: "#fff", fontWeight: "700", fontSize: 18 },
  headerSubtitle: { color: "#ffece8", fontSize: 12, marginTop: 2 },
  buttonSmall: {
    backgroundColor: "#000",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  buttonSmallText: { color: "#FFD700", fontWeight: "700", fontSize: 12 },
  circle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#FFD700",
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.6,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 16,
    elevation: 10,
  },
  circleText: { fontSize: 28, fontWeight: "800", color: "#000" },
  card: {
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 3,
  },
  cardSelected: { borderWidth: 2, borderColor: "#FFD700" },
  cardDisabled: { opacity: 0.65 },
  left: { marginRight: 12 },
  avatar: { width: 72, height: 96, borderRadius: 10 },
  center: { flex: 1 },
  nome: { fontSize: 16, fontWeight: "700", color: "#111", marginBottom: 6 },
  partidoRow: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  partidoIcon: { width: 20, height: 20, marginRight: 6, borderRadius: 4 },
  partidoText: { fontSize: 13, color: "#666", fontWeight: "600" },
  progressWrap: {
    height: 12,
    backgroundColor: "#eee",
    borderRadius: 8,
    overflow: "hidden",
    position: "relative",
  },
  progress: { height: "100%" },
  percentText: {
    position: "absolute",
    right: 8,
    top: -18,
    fontSize: 12,
    color: "#444",
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  votosText: { fontSize: 16, fontWeight: "800", color: "#111", marginLeft: 12 },
  footer: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 18,
    backgroundColor: "#fff",
    borderRadius: 14,
    padding: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 6 },
    shadowRadius: 12,
    elevation: 6,
  },
  footerNote: { fontSize: 13, color: "#333", fontWeight: "600" },
  confirmButton: {
    backgroundColor: "#000",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
  },
  confirmButtonDisabled: { backgroundColor: "#cccccc" },
  confirmText: { color: "#FFD700", fontWeight: "800", fontSize: 14 },
  detailsBtn: {
    backgroundColor: "#FFD700",
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignSelf: "flex-start",
  },
  detailsBtnText: { fontSize: 12, fontWeight: "700", color: "#000" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.45)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalBox: {
    width: "100%",
    maxWidth: 420,
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginBottom: 6,
    textAlign: "center",
  },
  modalMessage: { fontSize: 14, color: "#444", textAlign: "center" },
  modalBtn: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10 },
  modalBtnText: { fontWeight: "700" },
});
